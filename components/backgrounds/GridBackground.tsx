import { ReactNode } from "react"

interface Props {
    children: ReactNode
}

const GridBackground = ({ children }: Props) => {
    return (
        <div className="min-h-screen w-full bg-background relative">
             <div 
                className="absolute top-0 left-0 w-full h-[70vh] bg-linear-to-b from-primary/20 to-transparent z-0 pointer-events-none"
            />
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(100,116,139,0.4) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(100,116,139,0.4) 1px, transparent 1px)
                    `,
                    backgroundSize: "40px 40px",
                }}
            />
            <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-background to-transparent z-0" />
            {children}
        </div>
    )
}

export default GridBackground
