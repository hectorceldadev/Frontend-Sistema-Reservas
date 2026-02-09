export interface ServiceDB {
    title: string
    price: number
    duration: number
    features: string[]
    short_desc: string
    full_desc: string
    id: string, 
    icon: string
    slug: string
    metadata: Record<string, string>
    image_url: string
}

export interface BusinessGalleryDB {
    id: string
    business_id: string
    image_url: string
    category: string | null
    description: string
    created_at: string
}

// ✅ 3. NUEVA: Interfaz básica del Negocio (Tabla businesses)
export interface BusinessDB {
    id: string
    name: string
    slug: string
    logo_url: string       // <--- NUEVO
    hero_image_url: string // <--- NUEVO
    adress: string
    category: string
    phone: number
}

export interface ProfileDB {
    id: string
    business_id: string
    role: string
    full_name: string
    description: string | null
    email: string
    is_active: boolean
    avatar_url: string
}

// ✅ 4. NUEVA: Interfaz compuesta (Negocio + Galería)
// Esta es la que usará tu página web
export interface BusinessWithGallery extends BusinessDB {
    gallery: BusinessGalleryDB[] // Un array de fotos
    profiles: ProfileDB[]
}