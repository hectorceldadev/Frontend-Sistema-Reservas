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
    // 1. Esperamos los params (Next.js 15)
    const { slug } = await params
    
    // 2. Traemos servicios (Cacheado)
    const services = await getServices()
    
    // 3. Buscamos
    const servicio = services?.find(item => item.slug === slug)

    if (!servicio) return { title: 'Servicio no encontrado' }

    return {
        title: `${servicio.title} | [NOMBRE]`, // Puedes usar variables de config aquí
        description: servicio.short_desc,
        keywords: [servicio.title, ...(metadataInfo.keywords || [])],
    }
}

const page = async ({ params }: ServicioProps) => {
    // 1. CORREGIDO: Obtenemos el slug de params, NO de services
    const { slug } = await params
    
    const services = await getServices()
    
    // 2. Buscamos el servicio correcto
    const servicio = services?.find(s => s.slug === slug)

    if (!servicio) notFound()

    return (
        <div>
            <Servicio servicio={servicio} />
        </div>
    )
}

export default page