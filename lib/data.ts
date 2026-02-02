import { cache } from "react";
import { supabase } from "./supabase";
import { SITE_CONFIG } from "@/config";
import { ServiceDB } from "./types/databaseTypes";

const { supabaseData } = SITE_CONFIG

export const getServices = cache(async() => {
    
    if (!supabaseData.businessId) throw new Error('Business ID is not valid')

    const { data, error } = await supabase
        .from('services')
        .select('title, short_desc, full_desc, duration, price, icon, slug, metadata, features, id')
        .eq('business_id', supabaseData.businessId)
        .eq('is_active', true)
        .order('price', { ascending: true })

    if (error) {
        console.error('Error fetching services')
        return
    }
    
    return data as ServiceDB[]
})