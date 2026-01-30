import { Servicio } from "@/components/pages/Servicio"
import { SITE_CONFIG } from "@/config"
import { notFound } from "next/navigation"

interface ServicioProps {
    params: Promise<{ slug: string }>
}

const { servicios, metadataInfo } = SITE_CONFIG

export const generateStaticParams = async () => {
    return servicios.items.map(service => ({
        slug: service.slug
    }))
}

export const generateMetadata = async ({ params }: ServicioProps) => {

    const { slug } = await params

    const servicio = servicios.items.find(item => item.slug === slug)

    if (!servicio) return { title: 'Servicio no encontrado' }

    return {
        title: `${servicio.title} | [NOMBRE] Peluquería en [PUEBLO]`,
        description: servicio.desc,
        keywords: [ servicio.title, ,metadataInfo.keywords ],
    }

}

const page = async ({ params }: ServicioProps) => {
  
    const { slug } = await params
    
    const servicio = servicios.items.find(servicio => servicio.slug === slug)

    if (!servicio) notFound()

    return (
    <div>
      <Servicio servicio={servicio} />
    </div>
  )
}

export default page
