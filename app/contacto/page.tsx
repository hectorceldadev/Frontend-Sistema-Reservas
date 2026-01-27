import { Contacto } from "@/components/Contacto"
import { SITE_CONFIG } from "@/config"
import { Metadata } from "next"

const { contacto } = SITE_CONFIG

export const metadata: Metadata = {
  title: contacto.metadata.title,
  description: contacto.metadata.description
}

const page = () => {
  return (
    <div className="pt-10">
        <Contacto />
    </div>
  )
}

export default page
