import { ReactNode } from "react";

interface Props {
    children: ReactNode
}

const RegularBackground = ({ children }: Props) => {
    return (
        <div className="min-h-screen w-full bg-background relative isolate">
            <div 
                className="absolute top-0 left-0 w-full h-[50vh] bg-linear-to-b from-primary/20 to-transparent z-0 pointer-events-none"
            />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}

export default RegularBackground