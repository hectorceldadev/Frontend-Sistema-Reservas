import { SITE_CONFIG } from "@/config"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET (request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Faltan las claves de Supabase')
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

        const { searchParams } = new URL(request.url)

        const email = searchParams.get('email')

        if (!email) {
            return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
        }

        const { data, error } = await supabaseAdmin
            .from('customers')
            .select('id')
            .eq('email', email)
            .eq('business_id', SITE_CONFIG.supabaseData.businessId)
            .single()

        if (error) {
            // El código PGRST116 significa "no se encontraron resultados" al usar .single()
            if (error.code === 'PGRST116') {
                return NextResponse.json({ success: false, message: 'Cliente no encontrado' }, { status: 404 })
            }
            console.error('Error supabase:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            customerId: data.id
        })
    } catch (error) {
        console.error('Error en la consulta al customerId')
        return NextResponse.json({ error }, { status: 500 })
    }
}