import { SITE_CONFIG } from "@/config";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: `Mis Reservas ${SITE_CONFIG.metadataInfo.title.template}`,
    description: "Consulta tus próximas citass y tu historial de servicios.",
    robots: {
        index: false,
        follow: false
    }
}

export default function ReservaLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    )
}