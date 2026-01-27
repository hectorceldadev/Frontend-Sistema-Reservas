'use client'

import Link from 'next/link'
import { Instagram, Heart, Phone, Facebook, Twitter, type LucideIcon } from 'lucide-react'
import { SITE_CONFIG } from '@/config'

// Diccionario de Iconos
const iconMap: Record<string, LucideIcon> = {
    Instagram: Instagram,
    Phone: Phone,
    Facebook: Facebook,
    Twitter: Twitter,
};

export const Footer = () => {
    const currentYear = new Date().getFullYear()
    // Extraemos config global y de servicios para la columna dinámica
    const { footer, servicios } = SITE_CONFIG;

    const serviceLinks = servicios.items.slice(0, 4);

    return (
        <footer className="bg-background-secondary border-t border-foreground/10 relative z-50 text-muted font-regular">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 md:ml-20 gap-12 mb-4">

                    {/* --- COLUMNA 1: BRANDING --- */}
                    <div className="md:col-span-1 space-y-4">
                        <Link href="/" className={`text-[42px] font-extrabold tracking-tighter text-foreground relative z-101 block leading-none font-title`}>
                            {/* Intentamos separar el logo por espacio para colorear la 2da palabra */}
                            <span>{footer.logo.split(' ')[0]}</span>
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60">
                                {footer.logo.split(' ').slice(1).join(' ')}
                            </span>
                        </Link>

                        <p className="text-sm leading-relaxed max-w-xs">
                            {footer.desc}
                        </p>

                        {/* Redes Sociales */}
                        <div className="flex gap-4 pt-2">
                            {footer.socialLinks.map((social, i) => {
                                const Icon = iconMap[social.icon] || Phone;
                                return (
                                    <Link
                                        key={i}
                                        href={social.href}
                                        target="_blank"
                                        className="w-10 h-10 rounded-full bg-background ring-1 ring-foreground/10 flex items-center justify-center text-muted-foreground hover:ring-primary text-primary transition-all"
                                    >
                                        <Icon size={20} />
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {/* --- COLUMNA 2: NAVEGACIÓN (EXPLORA) --- */}
                    {footer.navSections.map((section, idx) => (
                        <div key={idx}>
                            <h4 className="font-bold text-primary mb-2 uppercase tracking-wide">{section.title}</h4>
                            <ul className="space-y-4 text-sm">
                                {section.items.map((item, i) => {
                                    if (item.href === '/') return
                                    else return (
                                        <li key={i}>
                                            <Link href={item.href} className="hover:text-primary transition-colors">
                                                {item.text}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ))}

                    {/* --- COLUMNA 3: SERVICIOS DESTACADOS (AUTOMÁTICA) --- */}
                    <div>
                        <h4 className="font-bold text-primary mb-2 uppercase tracking-wide">Servicios</h4>
                        <ul className="space-y-4 text-sm">
                            {serviceLinks.map((service, i) => (
                                <li key={i}>
                                    <Link
                                        href={`/servicios/${service.slug}`}
                                        className="hover:text-primary transition-colors"
                                    >
                                        {service.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                {/* --- COPYRIGHT --- */}
                <div className="pt-4 border-t border-white/10 flex flex-col justify-center items-center gap-4 text-sm">
                    <p className='text-center'>
                        © {footer.copyright.replace('[AÑO]', currentYear.toString())}. Todos los derechos reservados.
                    </p>
                    {/* <p className="flex items-center gap-1">
                        Hecho con <Heart size={14} className="text-primary fill-primary" /> por
                        <Link href="https://tunegocioeninternet.es" className="hover:text-foreground transition-colors">
                            tunegocioeninternet.es
                        </Link>
                    </p> */}
                </div>
            </div>
        </footer>
    )
}