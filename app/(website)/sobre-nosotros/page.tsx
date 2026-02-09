import { SobreNosotros } from "@/components/pages/SobreNosotros"
import { SITE_CONFIG } from "@/config"
import { getBusiness } from "@/lib/data"
import { Metadata } from "next"

const { sobreNosotros } = SITE_CONFIG

export const metadata: Metadata = {
  title: sobreNosotros.metadata.title,
  description: sobreNosotros.metadata.description
}

const page = async () => {

  const business = await getBusiness()

  if (!business) return null

  const staff = business?.profiles || []

  return (
    <div>
      <SobreNosotros business={business} staff={staff} />
    </div>
  )
}

export default page
