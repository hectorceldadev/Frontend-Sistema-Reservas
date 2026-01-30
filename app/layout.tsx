import "./globals.css";
import BackgroundSelector from "@/components/backgrounds/BackgroundSelector";
import { Anton, Geist, Lato, Open_Sans, Oswald, Playfair_Display } from "next/font/google";
import { SITE_CONFIG } from "@/config";
import { Metadata, Viewport } from "next";
import JsonLd from "@/components/schema/JsonLd";
import { Toaster } from "sonner"

const { metadataInfo } = SITE_CONFIG

export const viewport: Viewport = {
  themeColor: 'black',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

export const metadata: Metadata = {
  title: metadataInfo.title.default, 
  description: metadataInfo.description,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Barberia Estilo',
    startupImage: [] //**COLOCAR IMAGENES  */
  },
  formatDetection: {
    telephone: false
  },
  metadataBase: new URL(metadataInfo.siteUrl),
  keywords: metadataInfo.keywords,
  openGraph: {
    title: metadataInfo.openGraph.title,
    description: metadataInfo.openGraph.description,
    url: metadataInfo.openGraph.url, 
    siteName: metadataInfo.openGraph.siteName,
    locale: metadataInfo.openGraph.locale,
    type: metadataInfo.openGraph.type as "website",
    images: metadataInfo.openGraph.images.map(image => ({
        url: image.url,
        width: image.width,
        height: image.height,
        alt: image.alt,
    }))
  }
}

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap'
})

const geist = Geist({
  subsets: ['latin'],
  weight: ['200', '400', '600', '700'],
  variable: '--font-geist',
  display: 'swap'
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'], 
  variable: '--font-playfair',
  display: 'swap'
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap'
})

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // Usaremos 500 o 700 para títulos
  variable: '--font-oswald',
  display: 'swap'
})

// 3. CONFIGURAMOS OPEN SANS (Lectura Amable)
const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-opensans',
  display: 'swap'
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`antialiased ${geist.variable} ${anton.variable} ${playfair.variable} ${lato.variable} ${oswald.variable} ${openSans.variable}`}
        data-theme={SITE_CONFIG.design.paleta}
        data-font={SITE_CONFIG.design.typography}
      >
        <JsonLd />
        <BackgroundSelector >
          {children}
          <Toaster />
        </BackgroundSelector>
      </body>
    </html>
  );
}