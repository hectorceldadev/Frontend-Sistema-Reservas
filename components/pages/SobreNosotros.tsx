'use client'

import { SITE_CONFIG } from '@/config'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Scissors, Users, Trophy, Star, LucideIcon } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { BusinessDB, ProfileDB } from '@/lib/types/databaseTypes'

gsap.registerPlugin(ScrollTrigger)

interface SobreNosotrosTypes {
    staff: ProfileDB[]
    business: BusinessDB
}

export const SobreNosotros = ({ staff, business }: SobreNosotrosTypes) => {
    
    const { sobreNosotros } = SITE_CONFIG

    const [ isPaused, setIsPaused ] = useState<boolean>(false)

    const containerRef = useRef<HTMLDivElement | null>(null)
    const sliderRef = useRef<HTMLDivElement | null>(null)
    const animationRef = useRef<gsap.core.Tween | null>(null)
    
    const duplicatedStats = [...sobreNosotros.stats, ...sobreNosotros.stats, ...sobreNosotros.stats, ...sobreNosotros.stats]

    const iconsMap: Record<string, LucideIcon> = {
        Trophy: Trophy,
        Users: Users,
        Scissors: Scissors,
        Star: Star
    } 

    useGSAP(() => {

        gsap.from('.animate-header', {
            y: 40,
            opacity: 0,
            duration: 0.6, 
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            }
        })
        
        gsap.from('.animate-content', {
            y: 40,
            opacity: 0,
            duration: 0.6, 
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: '.animate-content',
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
        <section className={`w-full py-24 relative overflow-hidden font-regular`}>
            <div className="max-w-7xl mx-auto w-full flex flex-col relative z-10">

                {/* --- SECCIÓN 1: HISTORIA VS IMAGEN --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 mt-8 mb-10 items-center gap-12 lg:gap-20">

                    <div className="col-span-1 mx-6 md:mx-14 stagger-container">
                        <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">
                            {sobreNosotros.badge}
                        </span>
                        <h2 className={`text-[42px] md:text-5xl text-foreground uppercase mb-8 font-title leading-[0.95] font-semibold`}>
                            {sobreNosotros.title.normal} <br />
                            <span className="text-primary">{sobreNosotros.title.highlight}</span>
                        </h2>
                        <div className="space-y-6 text-muted text-lg">
                            {/* Renderizamos descripción y permitimos HTML básico en negritas si se necesita */}
                            <p dangerouslySetInnerHTML={{ __html: sobreNosotros.desc.part1 }} />
                            
                            <p className='animate-header' dangerouslySetInnerHTML={{ __html: sobreNosotros.desc.part2 }} />

                            <div className="pt-4 border-l-4 border-primary pl-6">
                                <p className="text-foreground italic font-medium">
                                    {`"${sobreNosotros.quote}"`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 stagger-container">
                        {/* Centramos la imagen horizontalmente en su columna */}
                        <div className="relative aspect-4/5 w-[80%] md:w-[65%] mx-auto rounded-3xl overflow-hidden bg-background-secondary border border-foreground/20 group">
                            <Image
                                src={business.hero_image_url}
                                alt="Imagen Sobre Nosotros"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Overlay degradado */}
                            <div className="absolute inset-0 bg-linear-to-t from-primary/30 via-transparent to-transparent opacity-80" />
                        </div>
                    </div>
                </div>

                {/* --- SECCIÓN 2: STATS MARQUEE --- */}
                <div
                    className={`w-max relative shrink-0 whitespace-nowrap bg-primary/10 border-y border-foreground/20 py-4 backdrop-blur-sm -skew-2 transition-transform duration-500`}
                >
                    <div
                        ref={sliderRef}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        className="flex w-max gap-8 overflow-hidden animate-marquee"
                    >
                        {duplicatedStats.map((stat, idx) => {
                            const Icon = iconsMap[stat.icon] || Star
                            return (
                                <div key={idx} className="bg-background-secondary shrink-0 whitespace-nowrap border w-60 border-foreground/20 p-6 rounded-2xl text-center hover:bg-background-secondary/90 transition-colors group font-title">
                                    <div className="inline-flex p-3 rounded-full bg-foreground/10 ring ring-foreground/20 text-primary mb-4 group-hover:scale-110 transition-transform">
                                        <Icon size={24} />
                                    </div>
                                    <h3 className={`text-4xl md:text-5xl text-foreground mb-2`}>
                                        {stat.value}<span className="text-primary text-2xl">{stat.suffix}</span>
                                    </h3>
                                    <p className="text-muted text-sm font-bold uppercase tracking-wider">
                                        {stat.label}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* --- SECCIÓN 3: TEAM --- */}
                <div
                    ref={containerRef} 
                    className="flex flex-col justify-start items-start px-6 pt-40 ">
                    <div className="mb-16">
                        <h2 className={`text-[42px] md:text-5xl text-foreground uppercase font-title leading-[0.95] font-semibold animate-header`}>
                            {sobreNosotros.teamTitle.normal} <br /><span className="text-primary">{sobreNosotros.teamTitle.highlight}</span>
                        </h2>
                        <p className="text-zinc-400 mt-4 max-w-lg mx-auto md:mx-0 animate-header">
                            {sobreNosotros.teamDesc}
                        </p>
                    </div>
                    <div className={`grid grid-cols-1 md:grid-cols-3 justify-center items-center gap-8 w-full`}>
                        {staff.map((member) => (
                            <div key={member.id} className="group col-span-1 flex justify-center items-center relative animate-content">
                                <div className="aspect-2/3 w-72 transition-all duration-300 group-hover:scale-102 cursor-pointer relative rounded-2xl overflow-hidden bg-background-secondary border border-foreground/20">
                                    <Image
                                        src={member.avatar_url}
                                        alt={member.full_name}
                                        fill
                                        className="object-cover transition-all duration-500"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent opacity-90 flex flex-col justify-end p-6">
                                        <h3 className={`text-3xl text-foreground uppercase translate-y-4 group-hover:translate-y-0 transition-transform duration-300 font-title`}>
                                            {member.full_name}
                                        </h3>
                                        <p className="text-primary font-bold uppercase text-xs tracking-wider translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                            {member.role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section >
    )
}