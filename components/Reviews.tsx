'use client'

import { Star, Quote, User } from "lucide-react"
import { SITE_CONFIG } from "@/config"
import { useRef, useState } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export const Reviews = () => {

    const { reviews, design } = SITE_CONFIG;

    const containerRef = useRef<HTMLElement | null>(null)
    const sliderRef = useRef<HTMLDivElement>(null)
    const animateRef = useRef<gsap.core.Tween | null>(null) // Referencia para controlar la animación
    const [isPause, setIsPause] = useState(false) // Estado para la pausa

    const marqueeReviews = [...reviews.items, ...reviews.items]; 

    // 1. Animación de Entrada (Títulos)
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
    }, { scope: containerRef })

    // 2. Lógica del Marquee (Movimiento + ScrollTrigger)
    useGSAP(() => {
        if (!sliderRef.current) return

        // Creamos la animación pero pausada inicialmente
        animateRef.current = gsap.to(sliderRef.current, {
            xPercent: -50, // Movemos exactamente el 50% (la mitad duplicada)
            duration: 80,  // Velocidad (ajusta los segundos si quieres más lento/rápido)
            ease: 'none',
            repeat: -1,
            paused: true   // Esperamos a que entre en pantalla
        })

        // Controlamos Play/Pause según el scroll para optimizar rendimiento
        ScrollTrigger.create({
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'bottom 0%',
            onEnter: () => animateRef.current?.play(),
            onLeave: () => animateRef.current?.pause(),
            onEnterBack: () => animateRef.current?.play(),
            onLeaveBack: () => animateRef.current?.pause()
        })

        // Limpieza al desmontar
        return () => {
            animateRef.current?.kill()
            ScrollTrigger.getAll().forEach(t => t.kill())
        }
    }, { scope: containerRef })

    // 3. Efecto "Slow Motion" al hacer Hover
    useGSAP(() => {
        if (animateRef.current) {
            // Si está en pausa, reducimos la velocidad a 0.2, si no, a 1 (normal)
            gsap.to(animateRef.current, {
                timeScale: isPause ? 0.2 : 1, 
                duration: 0.5 
            })
        }
    }, [isPause])

    return (
        <section
            ref={containerRef} 
            className="w-full z-10 py-10 overflow-hidden relative font-regular">
            
            {/* --- CABECERA --- */}
            <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-16">
                <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs mb-3 block animate-header">
                    {reviews.badge}
                </span>
                <h2 className={`text-[42px] md:text-5xl text-foreground uppercase font-title leading-[0.95] font-semibold animate-header`}>
                    {reviews.title.split(' ').slice(0, -2).join(' ')} <br />
                    <span className="text-primary">
                        {reviews.title.split(' ').slice(-2).join(' ')}
                    </span>
                </h2>
                <p className="text-muted mt-4 max-w-md animate-header">
                    {reviews.desc}
                </p>
            </div>

            {/* --- SLIDER INFINITO --- */}
            <div 
                // Añadimos los eventos para detectar el ratón
                onMouseEnter={() => setIsPause(true)}
                onMouseLeave={() => setIsPause(false)}
                className={`${design.background === 'salon-de-belleza' ? 'relative w-full' : 'relative w-full bg-primary/5 border-y border-foreground/10 py-10 backdrop-blur-sm transform'} transition-colors duration-300`}
            >
                
                {/* Sombras laterales */}
                {design.background !== 'salon-de-belleza' && (
                    <>
                        <div className="absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-background via-background/80 to-transparent z-20 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-background via-background/80 to-transparent z-20 pointer-events-none" />
                    </>
                )}

                {/* Contenedor Animado */}
                <div 
                    ref={sliderRef}
                    className="flex w-max px-4"
                >
                    {marqueeReviews.map((review, i) => (
                        <div
                            key={`${i}-${review.user}`}
                            // Mantenemos el mr-6 para el espacio perfecto sin 'gap'
                            className="flex flex-col mr-6 relative w-80 md:w-96 shrink-0 p-8 rounded-3xl bg-background-secondary border border-foreground/10 transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 hover:scale-[1.02]"
                        >
                            {/* Icono decorativo */}
                            <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10 rotate-180" />

                            {/* ESTRELLAS */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, starIndex) => (
                                    <Star
                                        key={starIndex}
                                        fill={starIndex < review.rating ? "currentColor" : "transparent"}
                                        className={`w-4 h-4 ${starIndex < review.rating ? "text-primary" : "text-muted"}`}
                                    />
                                ))}
                            </div>

                            {/* CONTENIDO */}
                            <p className="text-muted text-sm md:text-base font-medium leading-relaxed mb-6 grow relative z-10 italic">
                                {`"${review.content}"`}
                            </p>

                            {/* USUARIO */}
                            <div className="flex items-center gap-4 pt-4 border-t border-foreground/10">
                                <div className="relative w-10 h-10 shrink-0 rounded-full overflow-hidden bg-foreground/10 border border-foreground/10 flex items-center justify-center">
                                    <User className="w-6 h-6 text-muted"/>
                                </div>
                                <div>
                                    <h4 className={`text-foreground text-base font-bold leading-none mb-1 uppercase`}>
                                        {review.user}
                                    </h4>
                                    <p className="text-primary text-xs font-bold tracking-wider uppercase">
                                        {review.servicio}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}