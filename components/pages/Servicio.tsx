'use client'

import Link from 'next/link'
import { ArrowUpRight, Check, LucideIcon, Scissors } from 'lucide-react'
import { SITE_CONFIG } from '@/config'
import gsap from 'gsap'
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ServiceDB } from '@/lib/types/databaseTypes'

gsap.registerPlugin(ScrollTrigger)

// CAMBIO 1: Recibimos 'relatedServices' ya filtrados en lugar de todos
interface ServivioTypes {
    service: ServiceDB
    relatedServices: ServiceDB[]
}

const iconsMap: Record<string, LucideIcon> = {
    Scissors: Scissors
}

export const Servicio = ({ service, relatedServices }: ServivioTypes) => {

    const { servicioEspecifico } = SITE_CONFIG

    // CAMBIO 2: Eliminamos la función viewMore() y usamos la prop directa
    const listaServicios = relatedServices;

    const Icon = iconsMap[service.icon] || Scissors

    return (
        <div className="min-h-screen w-full relative font-regular">
            {/* ... (EL RESTO DEL JSX SE MANTIENE EXACTAMENTE IGUAL) ... */}
            <div className="absolute top-0 right-0 w-100 h-100 bg-primary/10 rounded-full blur-[150px] pointer-events-none z-10" />

            <div className={`max-w-7xl mx-auto px-6 md:px-10 pt-30 relative z-20 w-full stagger-container`}>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start stagger-container">
                    {/* ... (Contenido de la izquierda y derecha igual) ... */}
                    <div className="flex flex-col gap-6 stagger-container">
                        <div className="w-20 h-20 rounded-2xl bg-background-secondary border border-foreground/10 flex items-center justify-center text-primary">
                            <div className="scale-150">
                                <Icon />
                            </div>
                        </div>

                        <h1 className={`text-[42px] md:text-5xl text-foreground uppercase font-semibold leading-none font-title`}>
                            {service.title}
                        </h1>

                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold text-primary font-title">
                                {service.price}€
                            </span>
                            <span className="px-3 py-1 rounded-full border border-foreground text-muted text-xs font-bold uppercase tracking-wide">
                                Duración Aprox. {service.duration} min
                            </span>
                        </div>

                        <p className="text-lg text-muted leading-relaxed max-w-lg">
                            {service.short_desc}
                        </p>
                    </div>

                    <div className="bg-background-secondary backdrop-blur-md border border-foreground/10 rounded-3xl p-8 lg:mt-10 md:p-10 relative overflow-hidden stagger-container">
                        <div className="absolute top-0 right-0 p-6 opacity-20">
                            <div className="w-24 h-24 border-t-2 border-r-2 border-primary rounded-tr-3xl" />
                        </div>

                        <h3 className={`text-2xl text-foreground uppercase mb-8 font-semibold font-title`}>
                            ¿Qué incluye?
                        </h3>

                        <ul className="space-y-6">
                            {service.features && service.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-4 group">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-foreground/20 group-hover:border-primary transition-colors">
                                        <Check className="w-3.5 h-3.5 text-primary-light" />
                                    </div>
                                    <div>
                                        <span className="text-muted font-bold block mb-1 group-hover:text-foreground transition-colors">
                                            {feature}
                                        </span>
                                        <span className="text-sm text-secondary">
                                            {idx === 1 ? 'Técnica profesional y productos de primera calidad.': 'Acabados perfectos y atención personalizada.'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-10 pt-8 border-t border-foreground/5 text-center">
                            <p className="text-xs text-muted uppercase tracking-widest">
                                {servicioEspecifico.queIncluyeFooter}
                            </p>
                        </div>
                    </div>
                </div>

                <div className='py-20'>
                    <h3 className={`text-foreground uppercase text-[42px] md:text-5xl font-title font-semibold leading-[0.95] `}>
                        También te <br /><span className='text-primary'>puede interesar</span>
                    </h3>
                    <div className={`grid grid-cols-1 gap-6 md:grid-cols-3 pt-10`}>
                        {/* CAMBIO 3: Usamos listaServicios que viene limpia de props */}
                        {listaServicios.map((servicio, id) => (
                            <Link
                                href={`/servicios/${servicio.slug}`}
                                key={servicio.id}
                                className="group service active:scale-95 relative z-50 p-6 rounded-2xl bg-background-secondary ring ring-foreground/20 hover:border-primary/50 transition-colors duration-300 hover:bg-background-secondary/80"
                            >
                                <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-foreground/20 rounded-xl text-muted group-hover:text-foreground group-hover:bg-primary transition-colors duration-300">
                                            {(() => {
                                                const ServiceIcon = iconsMap[servicio.icon] || Scissors;
                                                return <ServiceIcon />;
                                            })()}
                                        </div>
                                        <span className={`text-4xl text-foreground/5 group-hover:text-primary/50 transition-colors font-black font-title`}>
                                            0{1 + id}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-baseline mb-3">
                                        <h3 className={`text-2xl text-foreground uppercase tracking-wide font-title font-semibold`}>
                                            {servicio.title}
                                        </h3>
                                        {servicio.price && (
                                            <span className="text-xl font-bold text-primary font-title">
                                                {servicio.price}€
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted leading-relaxed mb-6">
                                        {servicio.short_desc}
                                    </p>
                                    <div className='mt-auto flex justify-between items-center'>
                                        <ul className="space-y-2">
                                            {servicio.features && servicio.features.slice(0, 2).map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-muted group-hover:text-muted transition-colors">
                                                    <Check className="w-3.5 h-3.5 text-primary" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <ArrowUpRight className='group-hover:text-primary text-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300' />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}