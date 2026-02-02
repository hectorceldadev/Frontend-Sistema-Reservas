import { Contacto } from "@/components/Contacto"
import Galeria from "@/components/Galeria"
import Hero from "@/components/Hero"
import { Reviews } from "@/components/Reviews"
import Servicios from "@/components/Servicios"
import { getServices } from "@/lib/data"

const page = async () => {

  const services = await getServices()

  console.log(services)

  return (
    <div>
      <Hero />
      <Servicios services={services ? services : []} />
      <Galeria />
      <Reviews />
      <Contacto />
    </div>
  )
}

export default page
