import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error("Faltan las variables de entorno de Supabase (URL o SERVICE_ROLE_KEY).");
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { bookingId, email, businessId } = await request.json()

        if (!bookingId) return NextResponse.json({ error: 'Es necesario un ID de reserva valido' }, { status: 400 })

        const { data: updatedBooking, error } = await supabaseAdmin
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('customer_email', email)
            .eq('business_id', businessId)
            .eq('id', bookingId)
            .select(`
                date,
                start_time,
                customer_name,
                customer_email,
                businesses (
                    name,
                    logo_url
                )
            `)
            .single()

        if (error) {
            console.error('Error actualizando el estado de la reserva: ', error)
            return NextResponse.json({ error }, { status: 500 })
        }

        if (updatedBooking && updatedBooking.customer_email) {
            const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3001'

            const businessData = Array.isArray(updatedBooking.businesses) ? updatedBooking.businesses[0] : updatedBooking.businesses
            const localName = businessData.name
            const localLogo = businessData.logo_url || ''

            const TIMEZONE = 'Europe/Madrid'

            const startTimeDate = new Date(updatedBooking.start_time)
            const timeString = formatInTimeZone(startTimeDate, TIMEZONE, 'HH:mm')
            const formattedDate = formatInTimeZone(startTimeDate, TIMEZONE, "yyyy-MM-dd")

            try {
                await fetch(`${DASHBOARD_URL}/api/notifications/dispatch`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.API_SECRET_KEY}`
                    },
                    body: JSON.stringify({
                        type: 'booking_cancellation',
                        email: updatedBooking.customer_email,
                        customerName: updatedBooking.customer_name,
                        date: formattedDate,
                        time: timeString,
                        businessName: localName,
                        logoUrl: localLogo
                    })
                })
            } catch (error) {
                console.error('Error delegando cancelación al Dashboard:', error)
            }

            }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error en el servidor: ', error)
        return NextResponse.json({ error }, { status: 500 })
    }
}