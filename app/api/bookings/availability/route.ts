import { createClient } from "@supabase/supabase-js";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { NextResponse } from "next/server";

const timeToMins = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
}

const minsToTime = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0')
    const m = (mins % 60).toString().padStart(2, '0')
    return `${h}:${m}`
}

const TIMEZONE = 'Europe/Madrid'

export async function GET (request: Request) {

    try {

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error("Faltan las variables de entorno de Supabase (URL o SERVICE_ROLE_KEY).");
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { searchParams } = new URL(request.url)

        const dateParam = searchParams.get('date')
        const staffId = searchParams.get('staffId')
        const duration = parseInt(searchParams.get('duration') || '30')
        const businessId = searchParams.get('businessId')

        if (!dateParam || !businessId) {
            return NextResponse.json({ error: 'Faltán parámetros' }, { status: 400 })
        }

        const localMidnight = fromZonedTime(`${dateParam}T00:00:00`, TIMEZONE)
        const dateInMadrid = toZonedTime(localMidnight, TIMEZONE)
        const dayOfWeek = dateInMadrid.getDay()

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

        const { data: blockedPeriods } = await supabaseAdmin
            .from('blocked_periods')
            .select('start_date, end_date, staff_id')
            .eq('business_id', businessId)
            .in('staff_id', workingStaffIds)
            .eq('status', 'active')

        const { data: interval } = await supabaseAdmin
            .from('businesses')
            .select('slot_interval')
            .eq('id', businessId)
            .single()

        const nowUtc = new Date()
        const nowInMadrid = toZonedTime(nowUtc, TIMEZONE)

        const todayString = `${nowInMadrid.getFullYear()}-${String(nowInMadrid.getMonth() + 1).padStart(2, '0')}-${String(nowInMadrid.getDate()).padStart(2, '0')}`
        const isToday = dateParam === todayString

        const bufferMins = 30
        const currentMinsOfDay = (nowInMadrid.getHours() * 60 + nowInMadrid.getMinutes()) + bufferMins 

        const slotsSet = new Set<string>()
        const INTERVAL = interval?.slot_interval ? interval.slot_interval : 15

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
                    const slotLocalStartStr = `${dateParam}T${minsToTime(slotStartMins)}:00`
                    const slotLocalEndStr = `${dateParam}T${minsToTime(slotEndMins)}:00`
    
                    const slotUtcStart = fromZonedTime(slotLocalStartStr, TIMEZONE)
                    const slotUtcEnd = fromZonedTime(slotLocalEndStr, TIMEZONE)
    
                    const staffBookings = bookings?.filter(b => b.staff_id === schedule.staff_id) || []
                    const hasBookingConflict = staffBookings.some(booking => {
                        const bookingStartUtc = new Date(booking.start_time)
                        const bookingEndUtc = new Date(booking.end_time)
    
                        return (slotUtcStart < bookingEndUtc && slotUtcEnd > bookingStartUtc)
                    })
    
                    if (hasBookingConflict) {
                        isAvailable = false
                    }
    
                    if (isAvailable) {
                        const staffBlocks = blockedPeriods?.filter(b => b.staff_id === schedule.staff_id) || []
                        const hasBlockConflict = staffBlocks.some(block => {
                            const blockStartUtc = new Date(block.start_date)
                            const blockEndUtc = new Date(block.end_date)
    
                            return (slotUtcStart < blockEndUtc && slotUtcEnd > blockStartUtc)
                        })
    
                        if (hasBlockConflict) {
                            isAvailable = false
                        }
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