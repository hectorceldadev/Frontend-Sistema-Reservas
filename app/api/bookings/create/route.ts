import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { ServiceDB } from '../../../../lib/types/databaseTypes';
import { format } from "date-fns";
import { es } from "date-fns/locale";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const timeToMins = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
}

export async function POST (request: Request) {
    try {

        const { businessId, bookingDate, bookingTime, staffId, services, client, paymentMethod } = await request.json()

        if (!businessId || !bookingDate || !bookingTime || !staffId || !services || services.length === 0 || !client) {
            return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
        }

        const servicesIds = services.map((s: ServiceDB) => s.id)

        const { data: dbServices, error: servicesError } = await supabaseAdmin
            .from('services')
            .select('id, title, price, duration')
            .eq('business_id', businessId)
            .in('id', servicesIds)

        if (servicesError || !services || services.length === 0) {
            return NextResponse.json({ error: 'Error validando los servicios o precios' }, { status: 500 })
        }

        const safeTotalPrice = dbServices.reduce((acc, s) => acc + s.price, 0)
        const safeTotalDuration = dbServices.reduce((acc: number, s: { duration: number }) => acc + s.duration, 0)

        let customerId: string

        const { data: existingCustomer } = await supabaseAdmin
            .from('customers')
            .select('id')
            .eq('business_id', businessId)
            .eq('email', client.email)
            .single()

        if (existingCustomer) {
            customerId = existingCustomer.id

            await supabaseAdmin.from('customers').upsert({
                id: customerId,
                business_id: businessId,
                email: client.email,
                full_name: client.name,
                phone: client.phone
            })
        } else {
            const { data: newCustomer, error: createError } = await supabaseAdmin
                .from('customers')
                .insert({
                    full_name: client.name,
                    email: client.email,
                    business_id: businessId,
                    phone: client.phone
                })
                .select()
                .single()

            if (createError) {
                throw new Error('Error creando cliente: ', createError)
            }
            customerId = newCustomer.id
        }

        const [ year, month, day ] = bookingDate.split('-').map(Number)
        const [ hours, minutes ] = bookingTime.split(':').map(Number)

        const startTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0))
        const endTime = new Date(startTime.getTime() + safeTotalDuration * 60000)

        const startMins = hours * 60 + minutes
        const endMins = startMins + safeTotalDuration

        let assignedStaffId = staffId

        if (assignedStaffId === 'any') {
            const dayOfWeek = startTime.getUTCDay()

            const { data: candidates } = await supabaseAdmin
                .from('staff_schedules')
                .select('*')
                .eq('business_id', businessId)
                .eq('day_of_week', dayOfWeek)
                .eq('is_working', true)

            if (!candidates || candidates.length === 0) {
                return NextResponse.json({ error: 'No hay personal disponible para este dia' }, { status: 409 })
            }

            const candidatesIds = candidates.map(c => c.staff_id)

            const { data: existingBookings } = await supabaseAdmin
                .from('bookings')
                .select('staff_id, start_time, end_time')
                .eq('business_id', businessId)
                .eq('date', bookingDate)
                .in('staff_id', candidatesIds)
                .neq('status', 'cancelled')
                .neq('status', 'rejected')

            const shuffledCandidates = candidates.sort(() => 0.5 - Math.random())

            const validCandidate = shuffledCandidates.find(candidate => {
                const shiftStart = timeToMins(candidate.start_time)
                const shiftEnd = timeToMins(candidate.end_time)

                if (startMins < shiftStart || endMins > shiftEnd) return false

                if (candidate.break_start && candidate.break_end) {
                    const breakStart = timeToMins(candidate.break_start)
                    const breakEnd = timeToMins(candidate.break_end)

                    if (breakStart < endMins && breakEnd > startMins) return false
                }

                const myBookings = existingBookings?.filter(b => b.staff_id === candidate.staff_id) || []

                const hasConflict = myBookings.some(booking => {
                    const bookingStart = new Date(booking.start_time)
                    const bookingEnd = new Date(booking.end_time)
                    
                    const bookingStartMins = bookingStart.getUTCHours() * 60 + bookingStart.getUTCMinutes()
                    const bookingEndMins = bookingEnd.getUTCHours() * 60 + bookingEnd.getUTCMinutes()

                    return (startMins < bookingEndMins && endMins > bookingStartMins)
                })

                return !hasConflict
            })

            if (validCandidate) {
                assignedStaffId = validCandidate.staff_id
            } else {
                return NextResponse.json({ error: 'Lamentablemente, ya no hay huecos disponibles a esta hora.' }, { status: 409 })
            }

            const { data: conflict } = await supabaseAdmin
                .from('bookings')
                .select('id')
                .eq('business_id', businessId)
                .eq('staff_id', assignedStaffId)
                .neq('status', 'cancelled')
                .neq('status', 'rejected')
                .lt('start_time', endTime.toISOString())
                .gt('end_time', startTime.toISOString())
                .single()

            if (conflict) {
                return NextResponse.json({ error: 'Este hueco acaba de ser reservado por otro cliente' }, { status: 409 })
            }

            const { data: newBooking, error: bookingError } = await supabaseAdmin
                .from('bookings')
                .insert({
                    business_id: businessId,
                    customer_id: customerId,
                    staff_id: assignedStaffId,
                    date: bookingDate,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    status: paymentMethod === 'card' ? 'pending-payment' : 'confirmed',
                    total_price: safeTotalPrice,
                    paymentMethod: paymentMethod,
                    customer_name: client.name,
                    customer_email: client.email,
                    customer_phone: client.phone
                })
                .select('*, staff:profiles(full_name)')
                .single()
            
            if (bookingError || !newBooking) {
                return NextResponse.json({ error: `Error insertando reserva: ${bookingError?.message}` }, { status: 500 })
            }

            const itemsToInsert = dbServices.map(s => ({
                booking_id: newBooking.id,
                business_id: businessId,
                service_id: s.id,
                price: s.price,
                duration: s.duration,
                service_name: s.title
            }))

            await supabaseAdmin.from('booking_items').insert(itemsToInsert)

            if (paymentMethod === 'card') {
                const serviceNames = dbServices.map(s => s.title)

                const staffName = newBooking.staff.full_name || 'El equipo'
                const formattedDate = format(startTime, "EEEE d 'de' MMMM", { locale: es })

                const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000'

                fetch(`${appUrl}/api/emails`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        customerName: client.name, 
                        email: client.email, 
                        date: format(new Date(bookingDate), 'dd/MM/yyyy'), 
                        time: bookingTime, 
                        services: serviceNames, 
                        price: safeTotalPrice, 
                        staffName: staffName
                    })
                }).catch(e => console.error('Error enviando email: ', e))

                fetch(`${appUrl}/api/push`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        email: client.email,
                        title: '✅ ¡Reserva Confirmada!',
                        message: `Hola ${client.name}, tu cita con ${staffName} es el ${formattedDate} a las ${bookingTime}`,
                        url: `${appUrl}/reserva`
                    })
                }).catch(e => console.error('Error enviando push: ', e))
            }

            return NextResponse.json({
                success: true,
                bookingId: newBooking.id,
                customerId
            })
        }
    } catch (error) {
        console.error('SERVER ERROR: ', error)
        return NextResponse.json({ error }, { status: 500 })
    }
}