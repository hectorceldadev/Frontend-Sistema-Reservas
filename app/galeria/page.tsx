import Galeria from "@/components/pages/Galeria"
import { SITE_CONFIG } from "@/config";
import { Metadata } from "next";

const { galeria } = SITE_CONFIG

export const metadata: Metadata = {
  title: galeria.metadata.title,
  description: galeria.metadata.description 
}

const page = () => {
  return (
    <div className="pt-20">
        <Galeria />
    </div>
  )
}

export default page
