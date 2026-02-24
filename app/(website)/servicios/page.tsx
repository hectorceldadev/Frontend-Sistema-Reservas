import Servicios from "@/components/pages/Servicios"
import { SITE_CONFIG } from "@/config"
import { getServices } from "@/lib/data"
import { Metadata } from "next"

export const dynamic = 'force-dynamic';

const { servicios } = SITE_CONFIG

export const metadata: Metadata = {
  title: servicios.metadata.title,
  description: servicios.metadata.description
}

const page = async () => {

  const services = await getServices()

  return (
    <div className="-mt-2">
        <Servicios services={services ? services : []} />
    </div>
  )
}

export default page
