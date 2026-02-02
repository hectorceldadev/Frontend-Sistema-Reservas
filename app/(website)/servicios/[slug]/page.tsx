import { Servicio } from "@/components/pages/Servicio"
import { SITE_CONFIG } from "@/config"
import { getServices } from "@/lib/data"
import { notFound } from "next/navigation"

interface ServicioProps {
    params: Promise<{ slug: string }>
}

const { metadataInfo } = SITE_CONFIG

export const generateStaticParams = async () => {
    const services = await getServices()
    if (!services) return []
    
    return services.map(service => ({
        slug: service.slug
    }))
}

export const generateMetadata = async ({ params }: ServicioProps) => {
    const { slug } = await params 
    const services = await getServices()
    const servicio = services?.find(item => item.slug === slug)

    if (!servicio) return { title: 'Servicio no encontrado' }

    return {
        title: `${servicio.title} | [NOMBRE]`, 
        description: servicio.short_desc,
        keywords: [ servicio.title, ...(metadataInfo.keywords || []) ],
    }
}

const page = async ({ params }: ServicioProps) => {
    const { slug } = await params
    const services = await getServices() || []
    
    // 1. Buscamos el servicio actual
    const servicio = services.find(s => s.slug === slug)

    if (!servicio) notFound()

    // 2. Calculamos los relacionados AQUÍ (en el servidor)
    // Filtramos el actual y desordenamos la lista
    const relatedServices = services
        .filter(s => s.slug !== slug) // Quitamos el actual
        .sort(() => 0.5 - Math.random()) // Aleatorio
        .slice(0, 3) // Cogemos 3

    return (
        <div>
            {/* Pasamos la lista ya recortada y aleatoria */}
            <Servicio service={servicio} relatedServices={relatedServices} />
        </div>
    )
}

export default page