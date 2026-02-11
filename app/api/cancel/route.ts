import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST (request: Request) {
    try {

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error("Faltan las variables de entorno de Supabase (URL o SERVICE_ROLE_KEY).");
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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