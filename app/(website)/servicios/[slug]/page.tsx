import { Servicio } from "@/components/pages/Servicio"
import { SITE_CONFIG } from "@/config"
import { getServices } from "@/lib/data"
import { notFound } from "next/navigation"

interface ServicioProps {
    params: Promise<{ slug: string }>
}

const { metadataInfo } = SITE_CONFIG

// Genera las rutas estáticas al hacer build
export const generateStaticParams = async () => {
    const services = await getServices() || []
    
    return services.map(service => ({
        slug: service.slug
    }))
}

// Genera el SEO dinámico
export const generateMetadata = async ({ params }: ServicioProps) => {
    // 1. CORREGIDO: Sacamos el slug de los params (URL), NO de los servicios
    const { slug } = await params 

    const services = await getServices() || []
    
    // 2. Buscamos el servicio que coincida con el slug
    const servicio = services.find(item => item.slug === slug)

    if (!servicio) return { title: 'Servicio no encontrado' }

    return {
        title: `${servicio.title} | [NOMBRE]`, // Ajusta [NOMBRE] con tu config si quieres
        description: servicio.short_desc,
        keywords: [ servicio.title, ...(metadataInfo.keywords || []) ],
    }
}

const page = async ({ params }: ServicioProps) => {
    // 1. CORREGIDO: Sacamos el slug de los params (URL)
    const { slug } = await params
    
    const services = await getServices() || []
    
    // 2. Buscamos el servicio
    const servicio = services.find(s => s.slug === slug)

    // 3. Si no existe, 404
    if (!servicio) notFound()

    return (
        <div>
            {/* Si tu componente Servicio espera 'relatedServices', pásaselo aquí también */}
            <Servicio service={servicio} services={services} />
        </div>
    )
}

export default page