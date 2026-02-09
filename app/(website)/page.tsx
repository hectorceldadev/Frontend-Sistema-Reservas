import { Contacto } from "@/components/Contacto"
import Galeria from "@/components/Galeria"
import Hero from "@/components/Hero"
import { Reviews } from "@/components/Reviews"
import Servicios from "@/components/Servicios"
import { getBusiness, getServices } from "@/lib/data"

const page = async () => {

  const [services, business] = await Promise.all([
    getServices(),
    getBusiness()
  ])

  if (!business) return null

  const galleryImages = business?.gallery || [] 

  return (
    <div>
      <Hero business={business} />
      <Servicios services={services ? services : []} />
      <Galeria galleryImages={galleryImages} />
      <Reviews />
      <Contacto />
    </div>
  )
}

export default page
