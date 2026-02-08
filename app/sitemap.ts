import { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/config' // Asegúrate de que SITE_CONFIG tiene el businessId
import { createClient } from '@supabase/supabase-js'

// Inicializamos cliente fuera (Mejor rendimiento)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  // 1. Definir rutas estáticas
  const routes = [
    '',
    '/servicios',
    '/galeria',
    '/reserva',
    '/sobre-nosotros',
  ]

  const staticRoutes: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    // 2. Obtener rutas dinámicas (Servicios)
    const { data: services } = await supabaseAdmin
      .from('services')
      .select('slug, created_at') // O updated_at si lo tienes
      .eq('business_id', SITE_CONFIG.supabaseData.businessId) // Filtramos por TU negocio
      .eq('is_active', true)
      .not('slug', 'is', null)

    const dynamicRoutes: MetadataRoute.Sitemap = (services || []).map((service) => ({
      url: `${BASE_URL}/servicios/${service.slug}`,
      lastModified: new Date(service.created_at),
      changeFrequency: 'weekly',
      priority: 0.9, 
    }))

    // 3. Fusionar y devolver
    return [...staticRoutes, ...dynamicRoutes]

  } catch (error) {
    console.error('Error generando sitemap:', error)
    // Fallback: Si falla la DB, devolvemos al menos las estáticas
    return staticRoutes
  }
}