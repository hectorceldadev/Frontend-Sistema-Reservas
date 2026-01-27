import { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', 
    },
    sitemap: `${SITE_CONFIG.metadataInfo.siteUrl}/sitemap.xml`,
  }
}