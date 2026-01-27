import { Contacto } from "@/components/Contacto"
import Galeria from "@/components/Galeria"
import Hero from "@/components/Hero"
import { Reviews } from "@/components/Reviews"
import Servicios from "@/components/Servicios"

const page = () => {
  return (
    <div>
      <Hero />
      <Servicios />
      <Galeria />
      <Reviews />
      <Contacto />
    </div>
  )
}

export default page
