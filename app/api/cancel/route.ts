import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST (request: Request) {
    try {
        const { bookingId, email, businessId } = await request.json()

        if (!bookingId) return NextResponse.json({ error: 'Es necesario un ID de reserva valido' }, { status: 400 })

        const { error } = await supabaseAdmin
            .from('bookings')
            .update({status: 'cancelled'})
            .eq('customer_email', email)
            .eq('business_id', businessId)
            .eq('id', bookingId)

        if (error) {
            console.error('Error actualizando el estado de la reserva: ', error)
            return NextResponse.json({ error }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error en el servidor: ', error)
        return NextResponse.json({ error }, { status: 500 })
    }
}