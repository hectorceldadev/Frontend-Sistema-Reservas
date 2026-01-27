import { ReactNode } from "react";

interface Props {
    children: ReactNode
}

const CrossBackground = ({ children }: Props) => {
    return (
        <div className="min-h-screen w-full bg-background relative isolate">
            
            {/* Patrón de Cruces Pequeñas */}
            <div 
                className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '20px 20px'
                }}
            />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}

export default CrossBackground