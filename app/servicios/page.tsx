import Servicios from "@/components/pages/Servicios"
import { SITE_CONFIG } from "@/config"
import { Metadata } from "next"

const { servicios } = SITE_CONFIG

export const metadata: Metadata = {
  title: servicios.metadata.title,
  description: servicios.metadata.description
}

const page = () => {
  return (
    <div className="-mt-2">
        <Servicios />
    </div>
  )
}

export default page
