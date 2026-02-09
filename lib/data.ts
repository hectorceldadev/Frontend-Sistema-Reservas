import { cache } from "react";
import { SITE_CONFIG } from "@/config";
import { BusinessWithGallery, ServiceDB } from "./types/databaseTypes";
import { supabase } from "./supabase";

const { supabaseData } = SITE_CONFIG


export const getServices = cache(async() => {

    if (!supabaseData.businessId) throw new Error('Business ID is not valid')

    const { data, error } = await supabase
        .from('services')
        .select('title, short_desc, full_desc, duration, price, icon, slug, metadata, features, id, image_url')
        .eq('business_id', supabaseData.businessId)
        .eq('is_active', true)
        .order('price', { ascending: true })

    if (error) {
        console.error('Error fetching services')
        return
    }
    
    return data as ServiceDB[]
})

export const getBusiness = cache(async() => {
    
    if (!supabaseData.businessId) throw new Error('Business ID is not valid')

    const { data, error } = await supabase
        .from('businesses')
        .select(`
            *,
            gallery:business_gallery(*),
            profiles(*)
        `)
        .eq('id', supabaseData.businessId)
        .single()
    
    if (error) {
        console.error('Error fetching business: ', error)
        return null
    }

    return data as BusinessWithGallery

})