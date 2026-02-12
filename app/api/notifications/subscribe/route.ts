import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST (request: Request) {
    try {
        const { subscription, email, userAgent, customerId, businessId } = await request.json() 

        if (!subscription || !email) {
            return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Faltan las claves de supabase')
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

        const { error } = await supabaseAdmin.from('push_subscriptions').upsert({
            user_email: email,
            user_agent: userAgent,
            customer_id: customerId,
            business_id: businessId,
            subscription: subscription
        }, { onConflict: 'business_id,user_email, subscription' })

        if (error) {
            console.error('Supabase error: ', error)
            return NextResponse.json({ error }, { status: 500 })
        } 

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error en API Subscribe: ', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}