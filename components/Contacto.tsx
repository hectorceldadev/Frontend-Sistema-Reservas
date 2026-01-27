'use client'

import Link from 'next/link'
import { MapPin, Phone, Clock, Send, Instagram, Smartphone, type LucideIcon } from 'lucide-react'
import { SITE_CONFIG } from '@/config'
import gsap from 'gsap'
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from '@gsap/react'
import { useRef } from 'react'

gsap.registerPlugin(ScrollTrigger)

const iconMap: Record<string, LucideIcon> = {
    Instagram: Instagram,
    Phone: Phone,
    Smartphone: Smartphone,
    //* AÑADIR ICONOS NECESARIOS
};

export const Contacto = () => {
    // Extraemos la configuración
    const { contacto } = SITE_CONFIG;
    const { info } = contacto;

    const containerRef = useRef<HTMLElement | null>(null)

    useGSAP(() => {

        gsap.from('.animate-header', {
            y: 40,
            opacity: 0,
            duration: 0.6,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        })

        gsap.from('.animate-content', {
            y: 40,
            opacity: 0,
            duration: 0.4,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.animate-content',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        })

    }, { scope: containerRef })

    return (
        <section
            ref={containerRef}
            id="contacto"
            className="w-full relative z-10 py-20 overflow-hidden font-regular"
        >
            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* --- CABECERA --- */}
                <div className="mb-16 md:text-left">
                    <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs mb-3 block animate-header">
                        {contacto.badge}
                    </span>
                    <h2 className={`text-[42px] md:text-5xl uppercase text-foreground mb-6 font-title leading-[0.95] font-semibold animate-header`}>
                        {contacto.title.split('\n')[0]} <span className="text-muted-foreground">&</span> <br />
                        <span className="text-primary">
                            {contacto.title.split('\n')[1]}
                        </span>
                    </h2>
                    <p className="text-muted text-lg max-w-xl animate-header">
                        {contacto.desc}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12 items-start">

                    {/* --- LADO IZQUIERDO: FORMULARIO --- */}
                    <div className="lg:col-span-2">
                        <div className="bg-background-secondary ring-1 ring-foreground/10 hover:ring-primary/20 transition-colors duration-300 p-8 md:p-10 rounded-3xl relative overflow-hidden group animate-content">

                            <form
                                method='POST'
                                action={contacto.formAction}
                                className="space-y-6 relative z-10"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Nombre</label>
                                        <input
                                            type="text"
                                            name='Nombre'
                                            placeholder="Tu nombre"
                                            required
                                            className="w-full px-5 py-4 rounded-xl bg-background border border-foreground/10 text-foreground placeholder-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Teléfono</label>
                                        <input
                                            type="tel"
                                            name='Teléfono'
                                            placeholder="600 000 000"
                                            required
                                            className="w-full px-5 py-4 rounded-xl bg-background border border-foreground/10 text-foreground placeholder-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Servicio</label>
                                    <div className="relative">
                                        <select
                                            name='Servicio'
                                            className="w-full px-5 py-4 rounded-xl bg-background border border-foreground/10 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            {contacto.formOptions.map((opcion, index) => (
                                                <option key={index} value={opcion} className="bg-background text-foreground">
                                                    {opcion}
                                                </option>
                                            ))}                                        </select>
                                        {/* Flecha custom */}
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-foreground">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Mensaje</label>
                                    <textarea
                                        rows={4}
                                        name='Mensaje'
                                        placeholder="Cuéntanos qué necesitas..."
                                        className="w-full px-5 py-4 rounded-xl bg-background border border-foreground/10 text-foreground placeholder-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type='submit'
                                    className="group/btn w-full py-4 bg-primary hover:bg-primary/90 text-foreground rounded-xl font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] flex items-center justify-center gap-2 ring ring-foreground/10"
                                >
                                    Enviar Mensaje
                                    <Send className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* --- LADO DERECHO: INFO Y MAPA --- */}
                    <div className="lg:col-span-1 flex flex-col gap-4 animate-content">

                        {/* Tarjeta de Info */}
                        <div className="bg-background-secondary ring-1 ring-foreground/10 hover:ring-primary/30 transition-colors duration-300 p-6 rounded-3xl space-y-4.5">

                            {/* Ubicación (Usamos business para dirección) */}
                            <div className="flex gap-5 items-start">
                                <div className="p-3 bg-foreground/5 rounded-lg border border-foreground/5 text-primary">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className={`text-xl text-foreground uppercase mb-1 font-title`}>Ubicación</h4>
                                    <p className="text-muted text-sm leading-relaxed">
                                        {contacto.direccion.calle || "Dirección no disponible"}<br />
                                        {contacto.direccion.cp} {contacto.direccion.municipyCity}
                                    </p>
                                </div>
                            </div>

                            {/* Horario (Usamos contacto.info.horario) */}
                            <div className="flex gap-5 items-start">
                                <div className="p-3 bg-foreground/5 rounded-lg border border-foreground/5 text-primary">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className={`text-xl text-foreground uppercase mb-1 font-title`}>Horario</h4>
                                    <ul className="text-muted text-sm">
                                        {info.horario.entresemana && <li>{info.horario.entresemana}</li>}
                                        {info.horario.sabado && <li>{info.horario.sabado}</li>}
                                        {info.horario.domingo && <li>{info.horario.domingo}</li>}
                                    </ul>
                                </div>
                            </div>

                            {/* Contacto (Usamos contacto.info.contacto) */}
                            <div className="flex gap-5 items-start">
                                <div className="p-3 bg-foreground/5 rounded-lg border border-foreground/5 text-primary">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className={`text-xl text-foreground uppercase mb-1 font-title`}>Contacto</h4>
                                    <a href={`tel:${info.contacto.telefono.replace(/\s/g, '')}`} className="text-muted text-sm transition-colors block mb-3">
                                        {info.contacto.telefono}
                                    </a>

                                    <div className="flex gap-3">
                                        {Object.values(info.contacto.links).map((link, i) => {
                                            const Icon = iconMap[link.icon] || Phone;
                                            return (
                                                <Link
                                                    key={i}
                                                    href={link.href}
                                                    target="_blank"
                                                    className="p-2 bg-white/5 rounded-md hover:bg-primary hover:text-white text-muted-foreground transition-all"
                                                >
                                                    <Icon size={18} className='text-muted' />
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-2xl ring ring-foreground/20 h-75 lg:h-auto relative transition-all duration-700">
                                <iframe src={contacto.iframe}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className='rounded-2xl'
                                >
                                </iframe>
                                {/* Overlay para que no sea tan brillante si el filtro CSS falla en algunos navegadores */}

                            </div>
                        </div>

                        {/* Mapa Embed */}

                    </div>
                </div>
            </div>
        </section>
    )
}