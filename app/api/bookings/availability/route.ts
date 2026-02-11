import { createClient } from "@supabase/supabase-js";
import { getDay, isSameDay } from "date-fns";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const timeToMins = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
}

const minsToTime = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0')
    const m = (mins % 60).toString().padStart(2, '0')
    return `${h}:${m}`
}

export async function GET (request: Request) {

    try {
        const { searchParams } = new URL(request.url)

        const dateParam = searchParams.get('date')
        const staffId = searchParams.get('staffId')
        const duration = parseInt(searchParams.get('duration') || '30')
        const businessId = searchParams.get('businessId')

        if (!dateParam || !businessId) {
            return NextResponse.json({ error: 'Faltán parámetros' }, { status: 400 })
        }

        const selectedDate = new Date(dateParam)
        const dayOfWeek = getDay(selectedDate)

        let scheduleQuery = supabaseAdmin
            .from('staff_schedules')
            .select('*')
            .eq('business_id', businessId)
            .eq('day_of_week', dayOfWeek)
            .eq('is_working', true)

        if (staffId && staffId !== 'any') {
            scheduleQuery = scheduleQuery.eq('staff_id', staffId)
        }

        const { data: schedules, error: scheduleError } = await scheduleQuery

        if (scheduleError || !schedules || schedules.length === 0) {
            return NextResponse.json({ slots: [] })
        }

        const workingStaffIds = schedules.map(s => s.staff_id)

        const { data: bookings } = await supabaseAdmin
            .from('bookings')
            .select('start_time, end_time, staff_id')
            .eq('business_id', businessId)
            .eq('date', dateParam)
            .in('staff_id', workingStaffIds)
            .neq('status', 'cancelled')
            .neq('status', 'rejected')

        const now = new Date()
        const isToday = isSameDay(selectedDate, now)

        const bufferMins = 30

        const timeZone = 'Europe/Madrid'
        const nowInBiz = new Date(now.toLocaleString('en-US', { timeZone }))
        const currentMinsOfDay = (nowInBiz.getHours() * 60 + nowInBiz.getMinutes()) + bufferMins

        const slotsSet = new Set<string>()
        const INTERVAL = 30

        schedules.forEach(schedule => {
            const shiftStart = timeToMins(schedule.start_time)
            const shiftEnd = timeToMins(schedule.end_time)

            for (let currentMins = shiftStart; currentMins <= shiftEnd - duration; currentMins += INTERVAL) {

                if (isToday && currentMins < currentMinsOfDay) {
                    continue
                }

                const timeString = minsToTime(currentMins)
                if (slotsSet.has(timeString)) continue

                const slotStartMins = currentMins
                const slotEndMins = currentMins + duration
                let isAvailable = true

                if (schedule.break_start && schedule.break_end) {
                    const breakStart = timeToMins(schedule.break_start)
                    const breakEnd = timeToMins(schedule.break_end)

                    if (slotStartMins < breakEnd && slotEndMins > breakStart) {
                        isAvailable = false
                    }
                }

                if (isAvailable) {
                    const staffBookings = bookings?.filter(b => b.staff_id === schedule.staff_id) || []

                    const hasConflict = staffBookings.some(booking => {

                        const formatter = new Intl.DateTimeFormat('es-ES', {
                            timeZone: 'Europe/Madrid',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        })

                        const startLocalTime = formatter.format(new Date(booking.start_time))
                        const endLocalTime = formatter.format(new Date(booking.end_time))

                        const bookingStartMins = timeToMins(startLocalTime)
                        const bookingEndMins = timeToMins(endLocalTime)

                        return (slotStartMins < bookingEndMins && slotEndMins > bookingStartMins) 
                    })

                    if (hasConflict) {
                        isAvailable = false
                    }
                }

                if (isAvailable) {
                    slotsSet.add(timeString)
                }
            }
        })

        const sortedSlots = Array.from(slotsSet).sort((a, b) => timeToMins(a) - timeToMins(b))

        return NextResponse.json({ slots: sortedSlots })

    } catch (error) {
        console.error('Error calculando la disponibilidad: ', error)
        return NextResponse.json({ error }, { status: 500 })
    }
}