import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('⚠️ FALTAN VARIABLES DE ENTORNO: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_KEY son obligatorias para inicializar el cliente de Supabase.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)