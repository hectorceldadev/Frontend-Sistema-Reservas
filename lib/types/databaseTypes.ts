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
}