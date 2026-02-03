import { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONFIG.metadataInfo.title.default,
    short_name: SITE_CONFIG.metadataInfo.openGraph.siteName || 'Reserva',
    description: SITE_CONFIG.metadataInfo.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
