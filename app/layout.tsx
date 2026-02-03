import "./globals.css";
import BackgroundSelector from "@/components/backgrounds/BackgroundSelector";
import { Anton, Geist } from "next/font/google";
import { SITE_CONFIG } from "@/config";
import { Metadata, Viewport } from "next";
import JsonLd from "@/components/schema/JsonLd";
import { Toaster } from "sonner"
import { BookingProvider } from "@/context/BookingContext";
import { BookingModal } from "@/components/booking";
import { getServices } from "@/lib/data";

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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: metadataInfo.openGraph.siteName || 'Barberia Estilo',
    startupImage: []
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  const services = await getServices() || []

  return (
    <html lang="es">
      <body
        className={`antialiased ${geist.variable} ${anton.variable}`}
        data-theme={SITE_CONFIG.design.paleta}
        data-font={SITE_CONFIG.design.typography}
      >
        <JsonLd />
        <BookingProvider>
          <BackgroundSelector >
            {children}
            <BookingModal services={services} />
            <Toaster />
          </BackgroundSelector>
        </BookingProvider>
      </body>
    </html>
  );
}