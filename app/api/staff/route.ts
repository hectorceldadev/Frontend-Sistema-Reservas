import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error("Faltan las variables de entorno de Supabase (URL o SERVICE_ROLE_KEY).");
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { searchParams } = new URL(request.url)
        const businessId = searchParams.get('businessId')

        if (!businessId) {
            return NextResponse.json({ error: 'Falta el businessId' }, { status: 400 })
        }

        const { data: staff, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('business_id', businessId)
            .eq('is_active', true)

        if (error) {
            return NextResponse.json({ error }, { status: 500 })
        }

        return NextResponse.json({ staff })
        
    }   catch (error: any) {
        console.error('Error fetching staff:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}