import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST (request: Request) {

    try {
        const { email, businessId } = await request.json()
    
        if (!email) return NextResponse.json({ bookings: [] })

        console.log(`Buscando citas para ${email} en: ${businessId}`)

        const { data, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                booking_items (
                    price,
                    services ( title, duration )
                ),
                staff:profiles!staff_id ( full_name )
                `)
                .eq('customer_email', email)
                .eq('business_id', businessId)
                .order('date', { ascending: false })
            
        if (error) {
            console.error('❌ Error Supabase:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        console.log(`✅ Citas encontradas: ${data?.length}`)
        return NextResponse.json({ booking: data })
    } catch (error: any) {
        console.error('💥 Error Servidor:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

}