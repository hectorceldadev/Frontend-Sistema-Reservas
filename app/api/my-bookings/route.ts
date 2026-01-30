import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function POST (request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ bookings: [] })
        }

        const { data: bookings, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                booking_items (
                    price, 
                    services ( title, duration )
                ),
                staff:profiles ( full_name )`)
            .eq('customer_email', email)
            .order('date', { ascending: false })
            .order('start_time', { ascending: false })

        if (error) throw error

        return NextResponse.json({ bookings })
    } catch (error: any) {
        console.error('Error buscando citas: ', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}