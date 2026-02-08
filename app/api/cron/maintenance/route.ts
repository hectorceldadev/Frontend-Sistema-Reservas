import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET (request: Request) {
    try {
        const authHeader = request.headers.get('authorization')
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Faltan las credenciales de Supabase' }, { status: 400 })
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        const now = new Date().toISOString()

        const { data, error } = await supabaseAdmin 
            .from('bookings')
            .update({ status: 'completed' })
            .eq('status', 'confirmed')
            .lt('end_time', now)
            .select('id')

        if (error) {
            throw new Error(`Error actualizando citas: ${error.message}`)
        }

        console.log(`[MAINTENANCE] Citas completadas: ${data?.length || 0}`)

        return NextResponse.json({
            success: true,
            updatedCount: data?.length || 0,
            timestamp: now
        })
    } catch (error) {
        console.error('[MAINTENANCE ERROR]: ', error)
        return NextResponse.json({ error }, { status: 500 })
    }
}