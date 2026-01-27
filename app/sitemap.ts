import { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.metadataInfo.siteUrl

  const staticRoutes = [
    '',              // Inicio
    '/servicios',
    '/galeria',
    '/contacto',
    '/sobre-nosotros',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8, 
  }))

  const servicesRoutes = SITE_CONFIG.servicios.items.map((service) => ({
    url: `${baseUrl}/servicios/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9, 
  }))

  return [...staticRoutes, ...servicesRoutes]
}