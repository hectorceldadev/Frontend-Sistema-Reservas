import Galeria from "@/components/pages/Galeria"
import { SITE_CONFIG } from "@/config";
import { getBusiness } from "@/lib/data";
import { Metadata } from "next";

const { galeria } = SITE_CONFIG

export const metadata: Metadata = {
  title: galeria.metadata.title,
  description: galeria.metadata.description 
}

const page = async () => {

  const business = await getBusiness()

  const galleryImages = business?.gallery || []

  return (
    <div className="pt-20">
        <Galeria galleryImages={galleryImages} />
    </div>
  )
}

export default page
