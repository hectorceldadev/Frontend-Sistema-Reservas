'use client'

import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { SITE_CONFIG } from "@/config"
import { useGSAP } from "@gsap/react"
import { useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const Galeria = () => {

    const { galeria, design } = SITE_CONFIG;
    
    const containerRef = useRef<HTMLElement | null>(null)
    const sliderRef = useRef<HTMLDivElement>(null)
    const [isPaused, setIsPaused] = useState(false)
    const animationRef = useRef<gsap.core.Tween | null>(null)

    // Duplicamos imágenes para el efecto infinito si es marquee
    const displayImages = galeria.layout === 'marquee' 
        ? [...galeria.images, ...galeria.images] 
        : galeria.images;


    useGSAP(() => {

        gsap.from('.animate-header', {
            y: 40,
            duration: 0.4,
            stagger: 0.2,
            opacity: 0,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        })

    }, { scope: containerRef })

    useGSAP(() => {

        if (!sliderRef.current) return

        animationRef.current =
            gsap.to(sliderRef.current, {
                xPercent: -50,
                duration: 20,
                ease: 'none',
                repeat: -1,
                paused: true
            })

        ScrollTrigger.create({
            trigger: containerRef.current,
            start: 'top 100%',
            end: 'bottom 0%',
            onEnter: () => animationRef.current?.play(),
            onLeave: () => animationRef.current?.pause(),
            onEnterBack: () => animationRef.current?.play(),
            onLeaveBack: () => animationRef.current?.pause()
        })

        return () => {
            animationRef.current?.kill()
            ScrollTrigger.getAll().forEach(t => t.kill())
        }

    }, { scope: sliderRef })

    useGSAP(() => {

        if (animationRef.current) {
            isPaused ? animationRef.current.timeScale(0.2) : animationRef.current.timeScale(1)
        }

    }, [isPaused])

    return (
        <section 
            ref={containerRef}
            className="w-full py-10 overflow-hidden relative font-regular">

            {/* --- CABECERA --- */}
            <div className="max-w-7xl mx-auto px-5 lg:px-10 relative z-10 mb-12">
                <span className="text-secondary font-bold tracking-widest uppercase text-xs mb-2 block animate-header">
                    {galeria.badge}
                </span>
                <h2 className={`text-[42px] md:text-5xl text-foreground uppercase leading-none font-title font-semibold animate-header`}>
                    {galeria.title}
                </h2>
                <p className="text-muted mt-4 max-w-md animate-header">
                    {galeria.desc}
                </p>
            </div>

            {/* --- CONTENIDO --- */}
            {galeria.layout === 'marquee' ? (
                // MODO MARQUEE
                <div 
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className="relative w-full z-20 mb-12">
                    {/* Gradient Masks */}
                    {
                        design.background === 'salon-de-belleza' 
                        ?
                        ''
                        : 
                        <>
                            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-32 bg-linear-to-r from-background to-transparent z-30 pointer-events-none" />
                            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-32 bg-linear-to-l from-background to-transparent z-30 pointer-events-none" />
                        </>
                    }

                    <div 
                        className={`transform ${design.background === 'salon-de-belleza' ? '' : '-skew-y-2'} py-4`}>
                        <div className={`bg-primary/5 border-y border-foreground/10 py-8 backdrop-blur-sm`}>
                            <div 
                            ref={sliderRef}
                            className="flex items-center w-max">
                                {displayImages.map((imagen, index) => (
                                    <div
                                        key={`marquee-${index}`}
                                        className="group relative mr-6 w-72 h-96 shrink-0 rounded-2xl overflow-hidden border border-foreground/10 bg-background-secondary transition-all duration-500 hover:scale-105 hover:border-primary/50 cursor-pointer"
                                    >
                                        <Image
                                            src={imagen.src}
                                            alt={imagen.alt}
                                            fill
                                            className={`object-cover transition-transform duration-700 group-hover:scale-110`}
                                            sizes="(max-width: 768px) 100vw, 300px"
                                        />
                                        <div className={`absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6`}>
                                            <div className="flex justify-between items-center">
                                                <p className="text-foreground text-sm font-bold leading-tight line-clamp-2 pr-4">
                                                    {imagen.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // MODO GRID
                <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {galeria.images.slice(0, 3).map((imagen, index) => (
                            <div
                                key={`grid-${index}`}
                                className="group relative aspect-square rounded-2xl overflow-hidden border border-foreground/10 bg-background-secondary transition-colors duration-300 hover:border-primary/50 animate-content"
                            >
                                <Image
                                    src={imagen.src}
                                    alt={imagen.alt}
                                    fill
                                    className={`object-cover transition-transform duration-700 ${design.background === 'salon-de-belleza' ? '' : ' grayscale group-hover:grayscale-0'} group-hover:scale-110`}
                                    sizes="(max-width: 768px) 100vw, 400px"
                                />
                                <div className={`absolute inset-0 bg-linear-to-t ${design.background === 'salon-de-belleza' ? 'from-foreground/30 via-foreground/10' : 'from-black/90 via-black/20'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6`}>
                                    <div className="flex justify-between items-center">
                                        <p className="text-foreground text-sm font-bold leading-tight line-clamp-2 pr-4">
                                            {imagen.alt}
                                        </p>
                                        <ArrowUpRight className="text-primary w-5 h-5 shrink-0" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- CTA BUTTON --- */}
            <div className="flex justify-center relative z-20 animate-content">
                <Link
                    href={galeria.cta.href}
                    className="group w-full sm:w-auto mx-5 rounded-xl ring-1 ring-foreground/10 bg-primary px-8 py-4 text-foreground transition-all hover:bg-primary/90 hover:ring-primary/50 active:scale-95"
                >
                    <div className="flex items-center justify-center gap-1 font-bold uppercase tracking-wide text-sm sm:text-base">
                        {galeria.cta.text}
                        <ArrowUpRight className="w-5 h-5 relative transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 text-foreground" />
                    </div>
                </Link>
            </div>

        </section>
    )
}

export default Galeria