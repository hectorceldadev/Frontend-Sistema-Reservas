import { ReactNode } from "react"

interface Props {
    children: ReactNode
}

const SoftBackground = ({ children }: Props) => {
    return (
        <div className="min-h-screen w-full relative bg-background overflow-hidden">
            
            {/* Capa de atmósfera dinámica */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                
                {/* Mancha 1: Color Primario (Arriba Izquierda) */}
                <div 
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px]"
                    style={{ background: 'var(--color-primary)', opacity: 0.15 }}
                />

                {/* Mancha 2: Color Secundario (Centro Derecha) */}
                <div 
                    className="absolute top-[30%] right-[-5%] w-[40%] h-[60%] rounded-full blur-[100px]"
                    style={{ background: 'var(--color-secondary)', opacity: 0.10 }}
                />

                {/* Mancha 3: Color Primario (Abajo un poco a la izquierda) */}
                <div 
                    className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-full blur-[130px]"
                    style={{ background: 'var(--color-primary)', opacity: 0.10 }}
                />
            </div>

            {/* Ruido sutil para textura (Opcional, le da toque premium) */}
            <div className="absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
            </div>

            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}

export default SoftBackground