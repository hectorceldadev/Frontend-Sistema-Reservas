'use client'

import { SITE_CONFIG } from "@/config"
import { ReactNode } from "react"
import GridBackground from "./GridBackground"
import SoftBackground from "./SoftBackground"
import RegularBackground from './RegularBackground';
import CrossBackground from "./CrossBackground"
import HexBackground from "./HexBackground"
import WaveBackground from "./WaveBackground"

interface Props {
    children: ReactNode
}

const BackgroundSelector = ({ children }: Props) => {

    const { design } = SITE_CONFIG

    const background = design.background

    if (background === 'barberia-urbana') {
        return <GridBackground>{children}</GridBackground>
    }
    if (background === 'salon-de-belleza') {
        return <SoftBackground>{children}</SoftBackground>
    }
    if (background === 'CrossBackground') {
        return <CrossBackground>{children}</CrossBackground>
    }
    if (background === 'HexBackground') {
        return <HexBackground>{children}</HexBackground>
    }
    if (background === 'WaveBackground') {
        return <WaveBackground>{children}</WaveBackground>
    }
    
    return <RegularBackground>{children}</RegularBackground>
  
}

export default BackgroundSelector
