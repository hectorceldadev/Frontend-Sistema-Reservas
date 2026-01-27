import { ReactNode } from "react";

interface Props {
    children: ReactNode
}

const HexBackground = ({ children }: Props) => {
    return (
        <div className="min-h-screen w-full bg-background relative isolate">
            
            {/* Patrón de Hexágonos */}
            <div 
                className="absolute inset-0 z-0 opacity-[0.25] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='40' viewBox='0 0 24 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40c5.523 0 10-4.477 10-10V10c0-5.523 4.477-10 10-10s10 4.477 10 10v20c0 5.523 4.477 10 10 10S40 35.523 40 30V20c0-5.523 4.477-10 10-10S60 14.477 60 20v20c0 5.523 4.477 10 10 10s10-4.477 10-10V30c0-5.523 4.477-10 10-10s10 4.477 10 10v20H0z' fill-opacity='0' stroke='%239C92AC' stroke-width='1' stroke-opacity='0.2' d='M12 0l12 7v13l-12 7-12-7V7z' transform='scale(1)'/%3E%3Cpath d='M12 0L24 7V21L12 28L0 21V7L12 0Z' fill='none' stroke='%239C92AC' stroke-opacity='0.2' stroke-width='0.5' /%3E%3C/svg%3E")`,
                    // Nota: He simplificado el SVG arriba para que sea ligero.
                    // Si no carga bien, usamos este patrón SVG estándar de hexágonos:
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%239C92AC' fill-opacity='0.15' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '28px 49px'
                }}
            />

            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}

export default HexBackground