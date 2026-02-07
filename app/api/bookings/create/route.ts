import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { NextResponse } from "next/server";
import { ServiceDB } from '../../../../lib/types/databaseTypes';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const timeToMins = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
}

export async function POST(request: Request) {
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

        if (servicesError || !dbServices || dbServices.length === 0) {
            return NextResponse.json({ error: 'No se pudieron validar los servicios o los precios' }, { status: 400 })
        }

        if (dbServices.length !== services.length) {
            return NextResponse.json({ error: 'Algunos servicios solicitados no son validos' }, { status: 400 })
        }

        const safeTotalPrice = dbServices.reduce((acc, s) => acc + s.price, 0)
        const safeTotalDuration = dbServices.reduce((acc, s) => acc + s.duration, 0)

        const { data: existingCustomer } = await supabaseAdmin
            .from('customers')
            .select('id')
            .eq('email', client.email)
            .eq('business_id', businessId)
            .single()

        let customerId = existingCustomer?.id

        if (customerId) {
            await supabaseAdmin
                .from('customers')
                .upsert({
                    id: customerId,
                    phone: client.phone,
                    full_name: client.name,
                    email: client.email,
                    business_id: businessId
                })
        } else {
            const { data: newCustomer, error: createError } = await supabaseAdmin
                .from('customers')
                .insert({
                    full_name: client.name,
                    phone: client.phone,
                    email: client.email,
                    business_id: businessId
                })
                .select()
                .single()

            if (createError) {
                return NextResponse.json({ error: 'Error creando el cliente: ', details: createError }, { status: 500 })
            }
            customerId = newCustomer.id
        }

        const [year, month, day] = bookingDate.split('-').map(Number)
        const [hours, minutes] = bookingTime.split(':').map(Number)

        // Creamos la fecha en UTC puro.
        // Nota: month - 1 porque en JS los meses van de 0 a 11
        const startTime = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0))
        
        // Calculamos el final sumando milisegundos
        const endTime = new Date(startTime.getTime() + safeTotalDuration * 60000)

        const startMins = hours * 60 + minutes
        const endMins = startMins + safeTotalDuration

        let assignedStaffId = staffId

        if (assignedStaffId === 'any') {
            const dayOfWeek = startTime.getDay()
            const { data: candidates } = await supabaseAdmin
                .from('staff_schedules')
                .select('*')
                .eq('business_id', businessId)
                .eq('day_of_week', dayOfWeek)
                .eq('is_working', true)

            const candidatesIds = candidates?.map(c => c.staff_id) || []
            const { data: existingBookings } = await supabaseAdmin
                .from('bookings')
                .select('staff_id, start_time, end_time')
                .eq('business_id', businessId)
                .eq('date', bookingDate)
                .in('staff_id', candidatesIds)
                .neq('status', 'cancelled')
                .neq('status', 'rejected')

            const shuffledCandidates = candidates?.sort(() => 0.5 - Math.random())
            const validCandidate = shuffledCandidates?.find(candidate => {
                const shiftStart = timeToMins(candidate.start_time)
                const shiftEnd = timeToMins(candidate.end_time)

                if (startMins < shiftStart || endMins > shiftEnd) return false

                if (candidate.break_start && candidate.break_end) {
                    const breakStart = timeToMins(candidate.break_start)
                    const breakEnd = timeToMins(candidate.break_end)

                    if (startMins < breakEnd && endMins > breakStart) return false
                }

                const myBookings = existingBookings?.filter(b => b.staff_id === candidate.staff_id) || []

                const hasConflict = myBookings.some(booking => {
                    const bStart = new Date(booking.start_time)
                    const bEnd = new Date(booking.end_time)
                    
                    const bStartMins = bStart.getUTCHours() * 60 + bStart.getUTCMinutes()
                    const bEndMins = bEnd.getUTCHours() * 60 + bEnd.getUTCMinutes()

                    return (startMins < bEndMins && endMins > bStartMins)
                })

                return !hasConflict
            })
            if (validCandidate) {
                assignedStaffId = validCandidate.staff_id
            } else {
                return NextResponse.json({ error: 'Lo sentimos, el hueco ha dejado de estar disponible' }, { status: 409 })
            }
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
                status: paymentMethod === 'card' ? 'pending_payment' : 'confirmed',
                total_price: safeTotalPrice, // <--- PRECIO SEGURO
                payment_method: paymentMethod,
                customer_name: client.name,
                customer_email: client.email,
                customer_phone: client.phone
            })
            .select('*, staff:profiles(full_name)')
            .single()

        if (bookingError || !newBooking) {
            return NextResponse.json({ error: 'Error al cargar la reserva: ', bookingError }, { status: 500 })
        }

        const itemsToInsert = dbServices.map(s => ({
            booking_id: newBooking.id,
            business_id: businessId,
            service_id: s.id,
            service_name: s.title,
            price: s.price,
            duration: s.duration
        }))

        const { error: itemsError } = await supabaseAdmin
            .from('booking_items')
            .insert(itemsToInsert)

        if (itemsError) {
            return NextResponse.json({ error: 'Error guardando servicios: ', itemsError }, { status: 500 })
        }

        if (paymentMethod !== 'card') {
            const serviceNames = dbServices.map(s => s.title)
            const staffName = newBooking.staff?.full_name || 'El equipo'
            const formattedDate = format(startTime, "EEEE d 'de' MMMM", { locale: es })

            const emailDateBase = new Date(`${bookingDate}T00:00:00`)

            const protocol = request.headers.get('x-forwarded-proto') || 'http'
            const host = request.headers.get('host')
            const appUrl = `${protocol}://${host}`

            fetch(`${appUrl}/api/emails`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: client.name,
                    email: client.email,
                    date: format(emailDateBase, 'dd/MM/yyyy'),
                    time: bookingTime,
                    services: serviceNames,
                    price: safeTotalPrice,
                    staffName: staffName,
                    bookingId: newBooking.id
                })
            }).catch(e => console.error('Error email: ', e))

            fetch(`${appUrl}/api/notifications/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: client.email,
                    title: '✅ ¡Reserva Confirmada!',
                    message: `Hola ${client.name}, tu cita es el ${formattedDate} a las ${bookingTime}`,
                    url: `${appUrl}/reserva`
                })
            }).catch(e => console.error('Error push: ', e))
        }
        return NextResponse.json({
            success: true,
            bookingId: newBooking.id,
            customerId
        })
    } catch (error) {
        console.error('SERVER ERROR: ', error)
        return NextResponse.json({ error }, { status: 500 })
    }
}