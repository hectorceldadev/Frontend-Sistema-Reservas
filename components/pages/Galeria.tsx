'use client'

import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { SITE_CONFIG } from "@/config"
import { useGSAP } from "@gsap/react"
import { useRef, useState, useMemo } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const Galeria = () => {

    const { galeria, design } = SITE_CONFIG;

    // ESTADO PARA FILTROS (Solo se usa si estamos en modo GRID)
    const [activeCategory, setActiveCategory] = useState("Todas");

    // 1. Extraemos categorías únicas dinámicamente
    const categories = useMemo(() => {
        const cats = galeria.images.map(img => img.category);
        return ["Todas", ...Array.from(new Set(cats))];
    }, [galeria.images]);

    // 2. Filtramos las imágenes
    const filteredImages = useMemo(() => {
        if (activeCategory === "Todas") return galeria.images;
        return galeria.images.filter(img => img.category === activeCategory);
    }, [activeCategory, galeria.images]);

    return (
        <section
            className="w-full py-12 overflow-hidden relative font-regular stagger-container">

            {/* --- CABECERA --- */}
            <div className="max-w-7xl mx-auto px-5 lg:px-10 relative z-10 mb-12 stagger-container">
                <span className="text-secondary font-bold tracking-widest uppercase text-xs mb-2 block animate-header">
                    {galeria.badge}
                </span>
                <h2 className={`text-[42px] md:text-5xl text-foreground uppercase leading-none font-title font-semibold animate-header`}>
                    {galeria.title}
                </h2>
                <p className="text-muted mt-4 max-w-md animate-header">
                    {galeria.desc}
                </p>


                <div className="flex flex-wrap gap-2 mt-8">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`
                                    px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border
                                    ${activeCategory === cat
                                    ? 'bg-primary text-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                                    : 'bg-background-secondary text-muted border-foreground/10 hover:border-primary/50 hover:text-foreground'
                                }
                                `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>


            <div className="max-w-7xl mx-auto px-5 lg:px-10 mb-12 grid-container">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 stagger-container">
                    {filteredImages.map((imagen, index) => (
                        <div
                            key={`${imagen.src}-${index}`} // Key única
                            className="group relative flex flex-col animate-card"
                        >
                            {/* TARJETA IMAGEN */}
                            <div className="relative aspect-4/5 w-full overflow-hidden rounded-4xl bg-background-secondary border border-foreground/5 shadow-xl shadow-primary/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10">
                                <Image
                                    src={imagen.src}
                                    alt={imagen.alt}
                                    fill
                                    className={`object-cover transition-transform duration-700 group-hover:scale-110`}
                                    sizes="(max-width: 768px) 100vw, 400px"
                                />

                                {/* Overlay Desktop (Hover) */}
                                <div className="hidden lg:flex absolute inset-0 bg-linear-to-t from-foreground/20 via-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex-col justify-end p-8">
                                    <span className="text-primary text-xs font-black uppercase tracking-[0.2em] mb-2 transition-transform duration-500 delay-100">
                                        {imagen.category}
                                    </span>
                                    <p className="text-white text-xl font-bold leading-tight mb-2 transition-transform duration-500 delay-200">
                                        {imagen.description}
                                    </p>
                                </div>
                            </div>

                            {/* Info Móvil (Siempre visible debajo) */}
                            <div className="mt-4 px-2 lg:hidden">
                                <span className="text-primary text-sm font-bold uppercase block mb-1">
                                    {imagen.category}
                                </span>
                                <h3 className="text-foreground text-md leading-tight">
                                    {imagen.description}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredImages.length === 0 && (
                    <div className="text-center py-20 animate-card">
                        <p className="text-muted">No hay imágenes disponibles en esta categoría.</p>
                    </div>
                )}
            </div>

        </section>
    )
}

export default Galeria