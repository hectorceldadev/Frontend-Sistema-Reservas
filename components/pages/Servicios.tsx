'use client'

import Link from 'next/link'
import { Scissors, User, Zap, Star, ArrowUpRight, LucideIcon, Check } from 'lucide-react'
import { SITE_CONFIG } from '@/config'
import { ServiceDB } from '@/lib/types/databaseTypes';

const iconMap: Record<string, LucideIcon> = {
    Scissors: Scissors,
    User: User,
    Zap: Zap,
    Star: Star,
    ArrowUpRight: ArrowUpRight
};

interface ServiciosTypes {
    services: ServiceDB[]
}

const Servicios = ({ services }: ServiciosTypes) => {
    
    const { servicios } = SITE_CONFIG;

    return (
        <section className="relative pt-26 pb-20 overflow-hidden font-regular">

            <div className="max-w-7xl mx-auto px-5 lg:px-10 relative z-10 pt-10">

                {/* --- HEADER SECCIÓN --- */}
                <div className="mb-16 stagger-container">
                    <h2 className={`text-[42px] md:text-5xl leading-[0.95] font-semibold text-foreground uppercase mb-4 font-title`}>
                        {servicios.title.split(' ')[0]} <br />
                        <span className="text-primary">{servicios.title.split(' ').slice(1).join(' ')}</span>
                    </h2>
                    <p className="text-muted max-w-md text-sm sm:text-base font-medium">
                        {servicios.desc}
                    </p>
                </div>

                {/* --- GRID DE SERVICIOS (Máximo 4 en Home) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-container">
                    {services.map((service, i) => {
                        const Icon = iconMap[service.icon] || Scissors;

                        return (
                            <Link
                                key={'Servicio' + i}
                                href={`/servicios/${service.slug}`}
                                className="group relative p-6 rounded-2xl bg-background-secondary ring-1 ring-foreground/20 hover:ring-primary/50 transition-all duration-300 hover:bg-background-secondary/80 active:scale-[0.98]"
                            >
                                {/* Efecto Glow en Hover */}
                                <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <div className="relative z-10 flex flex-col h-full">
                                    
                                    {/* Header Card */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-foreground/10 rounded-xl text-foreground group-hover:bg-primary transition-colors duration-300">
                                            <Icon size={24} />
                                        </div>
                                        {/* ID decorativo o numero */}
                                        <span className={`text-4xl text-muted/10 font-title group-hover:text-muted/40 transition-colors font-black`}>
                                            0{services.indexOf(service) + 1}
                                        </span>
                                    </div>

                                    {/* Título y Precio */}
                                    <div className="flex justify-between items-baseline mb-3">
                                        <h3 className={`text-2xl text-foreground uppercase tracking-wide font-title font-semibold`}>
                                            {service.title}
                                        </h3>
                                        {service.price && (
                                            <span className="text-xl font-bold text-primary font-title">
                                                {service.price}
                                            </span>
                                        )}
                                    </div>

                                    {/* Descripción */}
                                    <p className="text-sm text-muted leading-relaxed mb-6 line-clamp-2">
                                        {service.short_desc}
                                    </p>

                                    {/* Footer Card (Flecha) */}
                                    <div className='mt-auto flex justify-between items-center pt-4'>
                                        <div className='flex flex-col justify-start gap-1 items-start'>
                                            {
                                                service.features &&
                                                    service.features.map((feature) => (
                                                        <div key={feature} className='flex gap-2 items-center'>
                                                            <Check className='text-primary w-4 h-4'/>
                                                            <span className='text-muted text-xs'>
                                                                {feature}
                                                            </span>
                                                        </div>
                                                    ))
                                            }
                                        </div>
                                        <ArrowUpRight className='w-6 h-6 text-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300' />
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default Servicios