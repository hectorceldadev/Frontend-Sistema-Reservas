import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
    try {
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