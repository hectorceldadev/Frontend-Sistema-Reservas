import { SobreNosotros } from "@/components/pages/SobreNosotros"
import { SITE_CONFIG } from "@/config"
import { Metadata } from "next"

const { sobreNosotros } = SITE_CONFIG

export const metadata: Metadata = {
  title: sobreNosotros.metadata.title,
  description: sobreNosotros.metadata.description
}

const page = () => {
  return (
    <div>
      <SobreNosotros />
    </div>
  )
}

export default page
