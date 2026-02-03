import { createClient } from "@supabase/supabase-js";
import { getDate } from "date-fns";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST (request: Request) {
    try {
        const { body } = await request.json()

        const { 
            client,
            date, 
            time,
            staffId,
            serviceIds,
            businessId
        } = body

        if (!client || !date || !time || !staffId || !serviceIds?.length) {
            return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
        }

        console.log(`📅 Procesando reserva para: ${client.email} el ${date} a las ${time}`)

        const { data: services, error: servicesError } = await supabaseAdmin
            .from('services')
            .select('id, price, duration, title')
            .eq('id', serviceIds)

        if (servicesError || !services) {
            return NextResponse.json({ error: 'Error al validar los servicios' }, { status: 400 })
        }

        const totalPrice = services.reduce((acc, s) => acc + s.price, 0)
        const totalDuration = services.reduce((acc, s) => acc + s.duration, 0)

        const [ hours, minutes ] = time.split(':').map(Number)
        const startDate = new Date()
        startDate.setHours(hours, minutes, 0, 0)

        const bookingStartMins = hours * 60 + minutes
        const bookingEndMins = bookingStartMins + totalDuration

        const endTimeISO = new Date(startDate.getTime() + totalDuration * 60000).toISOString()
        const startTimeISO = startDate.toISOString()

        let assignedStaffId = staffId

        const dayOfWeek = getDate(new Date(date))

        const { data: schedules } = await supabaseAdmin
            .from('staff_schedules')
            .select('*')
            .eq('business_id', businessId)
            .eq('day_of_week', dayOfWeek)
            .eq('is_working', true)

        const { data: busySlots } = await supabaseAdmin
            .from('bookings')
            .select('start_time, end_time, staff_id')
            .eq('business_id', businessId)
            .eq('date', date)
            .neq('status', 'cancelled')

        if (assignedStaffId === 'any') {
            const availableStaff = schedules?.find(schedule => {
                const [ startH, startM ] = schedule.start_time.split(':').map(Number)
                const [ endH, endM ] = schedule.end_time.split(':').map(Number)
                const shiftStart = startH * 60 + startM
                const shiftEnd = endH * 60 + endM

                if (bookingStartMins < shiftStart || bookingEndMins > shiftEnd) return false

                if (schedule.break_start && schedule.break_end) {
                    const [ bStartH, bStartM ] = schedule.break_start.split(':').map(Number)
                    const [ bEndH, bEndM ] = schedule.break_end.split(':').map(Number)
                    const breakStart = bStartH * 60 + bStartM
                    const breakEnd = bEndH * 60 + bEndM
                    
                    if (bookingStartMins < breakEnd && bookingEndMins > breakStart) return false
                }

                const hasConflict = busySlots?.some(slot => {
                    if (slot.staff_id !== schedule.staff_id) return false

                    const slotStart = new Date(slot.start_time)
                    const slotEnd = new Date(slot.end_time)
                    const slotStartMins = slotStart.getHours() * 60 + slotStart.getMinutes()
                    const slotEndMins = slotEnd.getHours() * 60 + slotEnd.getMinutes()

                    return (bookingStartMins < slotEndMins && bookingEndMins > slotStartMins)
                })

                return !hasConflict

            })

            if (!availableStaff) {
                return NextResponse.json({ error: 'Lo siento, ya no quedan huecos disponibles para esta hora' }, { status: 400 })
            }
            assignedStaffId = assignedStaffId.staff_id
        } else {
            const isBusy = busySlots?.some(slot => {
                if (slot.staff_id !== assignedStaffId) return false

                const slotStart = new Date(slot.start_time)
                const slotEnd = new Date(slot.end_time)
                const slotStartMins = slotStart.getHours() * 60 + slotStart.getMinutes()
                const slotEndMins = slotEnd.getHours() * 60 + slotEnd.getMinutes()
                
                return (bookingStartMins < slotEndMins && bookingEndMins > slotStartMins)
            })

            if (isBusy) {
                return NextResponse.json({ error: 'El profesional seleccionado ya ha sido reservado en ese horario.' }, { status: 409})
            }
        }

        const { data: existingCustomer } = await supabaseAdmin
            .from('customers')
            .select('id')
            .eq('email', client.email)
            .eq('business_id', businessId)
            .single()

        let customerId = existingCustomer?.id

        if (customerId) {
            await supabaseAdmin.from('customers').update({
                full_name: client.name,
                phone: client.phone
            })
        } else {
            const { data: newCustomer, error: customerError } = await supabaseAdmin
                .from('customers')
                .insert({
                    full_name: client.name,
                    email: client.email,
                    phone: client.phone,
                    business_id: businessId
                })
                .select()
                .single()
            
            if (customerError) throw customerError
            customerId = newCustomer.id
        }

        const { data: newBooking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .insert({
                business_id: businessId,
                customer_id: customerId,
                staff_id: assignedStaffId,
                date: date,
                start_time: startTimeISO,
                end_time: endTimeISO,
                status: 'confirmed', // O 'pending_payment' si integras Stripe
                total_price: totalPrice,
                customer_name: client.name,
                customer_email: client.email,
                customer_phone: client.phone
            })
            .select()
            .single()

        if (bookingError) throw bookingError

        const itemsToInsert = services.map(s => ({
            booking_id: newBooking.id,
            service_id: s.id,
            price: s.price
        }))

        const { error: itemsError } = await supabaseAdmin
            .from('booking_items')
            .insert(itemsToInsert)

        if (itemsError) throw itemsError

        return NextResponse.json({
            success: true,
            bookingId: newBooking.id,
            customer_id: customerId,
            totalPrice,
            staffId: assignedStaffId
        })
    } catch (error: any) {
        console.error('💥 Error creando reserva:', error)
        return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
    }
}