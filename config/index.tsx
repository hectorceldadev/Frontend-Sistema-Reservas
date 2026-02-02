export interface SiteConfig {
    supabaseData: {
        businessId: string
    }
    metadataInfo: {
        title: {
            default: string
            template: string
        }
        description: string
        siteUrl: string
        keywords: string[]
        openGraph: {
            title: string,
            description: string
            url: string
            siteName: string
            locale: string
            type: string
            images: [
                {
                    url: string
                    width: 1200,
                    height: 630,
                    alt: string
                }
            ]
        }
    }
    schemaInfo: {
        businessType: 'HairSalon' | 'BeautySalon'
        address: {
            street: string
            city: string
            postalCode: string
            country: string
        }
        geo: {
            latitude: number
            longitude: number
        }
        areaServed: string[]
        priceRange: string // Ej: "$", "$$", "$$$"
        openingHours: Array<{
            days: string[] // Ej: ['Monday', 'Tuesday']
            opens: string
            closes: string
        }>
    }
    navBar: {
        logo: {
            textOrImage: string
            href: string
        }
        navegacion: Array<{
            href: string
            text: string
        }>
        cta: {
            text: string
        }
    }
    hero: {
        badge: string
        title: string
        desc: string
        ctaPrimary: {
            href: string
            icon: string
            text: string
        }
        ctaSecondary: {
            href: string
            icon: string
            text: string
        }
        showSocialProof: boolean
        image: '/images/home/salon-belleza-hero.webp' | '/images/home/barberia-urbana-hero.webp' | '/images/home/peluqueria-hero.webp'
    }
    servicios: {
        metadata: {
            title: string
            description: string
        }
        title: string
        desc: string
        ctaPrimary: {
            text: string
            icon: string
            href: string
        }
        items: Array<{
            id: string
            title: string
            desc: string
            fullDesc: string
            icon: string
            price: string
            slug: string
            features: string[]
            duracion: string
        }>
    }
    servicioEspecifico: {
        queIncluyeFooter: string
    }
    galeria: {
        metadata: {
            title: string
            description: string
        }
        badge: string
        title: string
        desc: string
        layout: 'marquee' | 'grid',
        layoutOnPage: 'marquee' | 'grid',
        cta: {
            text: string
            href: string
        }
        images: Array<{
            src: string
            alt: string
            category: string
            description: string
        }>;
    };
    reviews: {
        badge: string
        title: string
        desc: string
        items: Array<{
            user: string
            servicio: string
            content: string
            rating: number
            icon: string
        }>
    }
    contacto: {
        metadata: {
            title: string
            description: string
        }
        badge: string
        title: string
        desc: string
        formAction: string
        formOptions: string[]
        mapEmbedUrl: string
        direccion: {
            calle: string
            cp: number
            municipyCity: string
        }
        info: {
            horario: {
                entresemana: string
                sabado: string
                domingo: string
                sabadoYDomingo: string
            },
            contacto: {
                telefono: string
                links: {
                    instagram: {
                        icon: string
                        href: string
                    },
                    phone: {
                        icon: string
                        href: string
                    }
                }
            }
        }
        iframe: string
    },
    footer: {
        logo: string
        desc: string
        socialLinks: Array<{
            icon: string
            href: string
        }>
        navSections: Array<{
            title: string
            items: Array<{
                text: string
                href: string
            }>
        }>
        copyright: string
    }
    sobreNosotros: {
        metadata: {
            title: string
            description: string
        }
        badge: string
        title: {
            normal: string
            highlight: string
        }
        desc: {
            part1: string
            part2: string
        }
        quote: string
        image: string
        stats: Array<{
            label: string
            value: number
            suffix: string
            icon: string
        }>
        teamTitle: {
            normal: string
            highlight: string
        }
        teamDesc: string
        team: Array<{
            id: number,
            name: string,
            role: string,
            image: string,
        }>
    }
    design: {
        background: 'barberia-urbana' | 'salon-de-belleza' | 'peluqueria-regular' | 'CrossBackground' | 'HexBackground' | 'WaveBackground'
        paleta: // Paletas Oscuras Originales
                | 'violet' | 'yellow' | 'green' | 'orange' | 'amber' | 'red' | 'lime' | 'emerald'
                | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'purple' | 'fuchsia' | 'pink'
                | 'rose' | 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone'

                // Nuevas Paletas Light
                | 'light-violet' | 'light-yellow' | 'light-green' | 'light-orange' | 'light-amber'
                | 'light-red' | 'light-lime' | 'light-emerald' | 'light-teal' | 'light-cyan'
                | 'light-sky' | 'light-blue' | 'light-indigo' | 'light-purple' | 'light-fuchsia'
                | 'light-pink' | 'light-rose' | 'light-slate' | 'light-gray' | 'light-zinc'
                | 'light-neutral' | 'light-stone'

                // Paletas Salón de Belleza (Estilo Nude/Pastel)
                | 'nude' | 'nude-rose' | 'lavender' | 'sage' | 'matcha' | 'glacial'
                | 'ocean' | 'latte' | 'blush' | 'mauve' | 'peach'
                typography: 'barberiaUrbana' | 'salonBelleza' | 'peluqueriaRegular'
    }
}

export const SITE_CONFIG: SiteConfig = {
    supabaseData: {
        businessId: 'b0880124-97ad-4560-8542-fbc31ff46a8f'
    },
    metadataInfo: {
        title: {
            default: '[NOMBRE] | [Peluquería en [PUEBLO]]',
            template: '%s | [[NOMBRE] Peluquería en [PUEBLO]]' // %s se sustituye por el nombre de la página (ej: "Servicios")
        },
        description: 'Tu peluquería referencia en [PUEBLO]. Especialistas [ESPECIFICAMOS SEGÚN NEGOCIO] Reserva tu cita aquí ->',
        siteUrl: 'https://tunegocioeninternet.es', //** */ Pon aquí el dominio real cuando lo tengas
        keywords: ['peluquería en [PUEBLO]', 'barbería', 'estilismo', 'corte unisex', 'tinte orgánico'],
        openGraph: {
            title: "[NOMBRE] | Peluquería en [PUEBLO]",
            description: "[ej: Cortes Fades, arreglos de barba y el mejor ambiente]. Reserva tu cita en [PUEBLO].",
            url: "https://[DOMINIO].es",
            siteName: "[NOMBRE]",
            locale: "es_ES",
            type: "website",
            images: [
                {
                    url: "/images/open-graph/open-graph.png", //*COLOCAR IMAGEN
                    width: 1200,
                    height: 630,
                    alt: "[NOMBRE] - Peluquería en [PUEBLO]",
                }
            ]
        }
    },
    schemaInfo: {
        businessType: 'HairSalon', //**AJUSTAR SI ES SALON DE BELLEZA O PELUQUERIA */
        address: { //** MODIFICAR A DIRECCION
            street: 'Calle Ejemplo 123',
            city: 'Valencia',
            postalCode: '46000',
            country: 'ES'
        },
        geo: {
            //** */ Importante para salir en "Cerca de mí" en Google Maps
            latitude: 39.4699,
            longitude: -0.3763
        },
        areaServed: [
            "[PUEBLO CERCANO]",
            "[PUEBLO CERCANO]",
            "[PUEBLO CERCANO]",
            "[PUEBLO CERCANO]",
            "[PUEBLO CERCANO]",
            "[PUEBLO CERCANO]",
        ],
        priceRange: '€€',
        openingHours: [ //**CONFIGURAR HORARIOS */
            {
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '10:00',
                closes: '20:00'
            },
            {
                days: ['Saturday'],
                opens: '10:00',
                closes: '14:00'
            }
        ]
    },
    navBar: {
        logo: {
            textOrImage: '[LOGO]',
            href: '/'
        },
        navegacion: [
            {
                href: '/',
                text: 'Inicio'
            },
            {
                href: '/sobre-nosotros',
                text: 'Sobre Nosotros'
            },
            {
                href: '/',
                text: 'Servicios',
            },
            {
                href: '/galeria',
                text: 'Galería'
            },
            {
                href: '/reserva',
                text: 'Reserva'
            },
        ],
        cta: {
            text: 'RESERVAR CITA'
        }
    },
    hero: {
        badge: '[Nombre del negocio] · EST[AÑO]',
        title: '[TÍTULO \nPRINCIPAL]',
        desc: '[Descripción principal] ej:La nueva referencia de peluquería masculina en Silla. Especialistas en fades, diseños y arreglo de barba. Tu sitio de confianza a solo 5 minutos de Picassent, Albal y Catarroja.',
        ctaPrimary: {
            icon: 'CalendarDays',
            text: 'RESERVAR CITA'
        },
        ctaSecondary: {
            href: '/servicios',
            text: 'Ver Servicios',
            icon: 'ArrowUpRight'
        },
        showSocialProof: true,
        image: "/images/home/salon-belleza-hero.webp",
    },
    servicios: {
        metadata: {
            title: 'Nuestros Servicios | [NOMBRE] Peluquería en [PUEBLO]',
            description: 'Descubre todos nuestros servicos en [NOMBRE], estamos en [DIRECCION ej: Calle...]'
        },
        title: 'NUESTROS SERVICIOS',
        desc: '[DESCRIPCIÓN] ej: No hacemos cortes estándar. Analizamos tu cráneo y facciones para darte el estilo que mejor te sienta. Precisión milimétrica.',
        ctaPrimary: {
            text: 'VER SERVICIOS',
            icon: 'ArrowUpRight',
            href: '/servicios'
        },
        items: [
            {
                id: '[servicio1]',
                title: '[Servicio 1]',
                desc: '[Servicio 1 Descripción] ej:Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes',
                fullDesc: '[Servicio 1 Full Descripción] ej:Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes',
                icon: 'Scissors',
                price: '15€',
                slug: 'slug-servicio', //** Colocar slug */
                features: ['Asesoramiento de imagen', 'Peinado con cera/polvo'],
                duracion: '30M'
            },
            {
                id: '[servicio2]',
                title: '[Servicio 1]',
                desc: '[Servicio 1 Descripción] ej:Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes',
                fullDesc: '[Servicio 1 Full Descripción] ej:Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes',
                icon: 'Scissors',
                price: '15€',
                slug: 'slug-servicio', //** Colocar slug */
                features: ['Asesoramiento de imagen', 'Peinado con cera/polvo'],
                duracion: '30M'
            },
            {
                id: '[servicio3]',
                title: '[Servicio 1]',
                desc: '[Servicio 1 Descripción] ej:Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes',
                fullDesc: '[Servicio 1 Full Descripción] ej:Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes',
                icon: 'Scissors',
                price: '15€',
                slug: 'slug-servicio', //** Colocar slug */
                features: ['Asesoramiento de imagen', 'Peinado con cera/polvo'],
                duracion: '30M'
            },
            {
                id: '[servicio4]',
                title: '[Servicio 1]',
                desc: '[Servicio 1 Descripción] ej:Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes',
                fullDesc: '[Servicio 1 Full Descripción] ej:Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes',
                icon: 'Scissors',
                price: '15€',
                slug: 'slug-servicio', //** Colocar slug */
                features: ['Asesoramiento de imagen', 'Peinado con cera/polvo'],
                duracion: '30M'
            },
            {
                id: '[servicio5]',
                title: '[Servicio 1]',
                desc: '[Servicio 1 Descripción] ej:Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes',
                fullDesc: '[Servicio 1 Full Descripción] ej:Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes',
                icon: 'Scissors',
                price: '15€',
                slug: 'slug-servicio', //** Colocar slug */
                features: ['Asesoramiento de imagen', 'Peinado con cera/polvo'],
                duracion: '30M'
            },
            {
                id: '[servicio6]',
                title: '[Servicio 1]',
                desc: '[Servicio 1 Descripción] ej:Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes',
                fullDesc: '[Servicio 1 Full Descripción] ej:Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes',
                icon: 'Scissors',
                price: '15€',
                slug: 'slug-servicio', //** Colocar slug */
                features: ['Asesoramiento de imagen', 'Peinado con cera/polvo'],
                duracion: '30M'
            },
            {
                id: '[servicio7]',
                title: '[Servicio 1]',
                desc: '[Servicio 1 Descripción] ej:Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes',
                fullDesc: '[Servicio 1 Full Descripción] ej:Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes',
                icon: 'Scissors',
                price: '15€',
                slug: 'slug-servicio', //** Colocar slug */
                features: ['Asesoramiento de imagen', 'Peinado con cera/polvo'],
                duracion: '30M'
            },
            {
                id: '[servicio8]',
                title: '[Servicio 1]',
                desc: '[Servicio 1 Descripción] ej:Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes',
                fullDesc: '[Servicio 1 Full Descripción] ej:Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes Más que un afeitado, perfilado geométrico o natural según tu facción a navaja y arreglo de volúmenes',
                icon: 'Scissors',
                price: '15€',
                slug: 'slug-servicio', //** Colocar slug */
                features: ['Asesoramiento de imagen', 'Peinado con cera/polvo'],
                duracion: '30M'
            },
        ]
    },
    servicioEspecifico: {
        queIncluyeFooter: 'ej: [Celda Barber • Silla, Valencia]'
    },
    galeria: {
        metadata: {
            title: 'Galeria | [NOMBRE] Peluquería en [PUEBLO]',
            description: '[EJ: Echa un vistazo a nuestros mejores trabajos. Encuentranos en [DIRECCIÓN: ej: Calle Andres 14, Alzira Valencia ]]. Reserva tu cita aquí ->'
        },
        badge: 'PORTFOLIO',
        title: 'GALERIA',
        desc: '[DESCRIPCIÓN DE LA GALERIA]',
        layout: 'marquee',
        layoutOnPage: 'grid',
        cta: {
            text: "VER TODA LA GALERÍA",
            href: "/galeria"
        },
        images: [
            {
                src: "/images/galeria/1.webp",
                alt: "[Descripción Imagen]",
                description: '[ej: Diseño con textura]',
                category: 'Diseño'
            },
            {
                src: "/images/galeria/2.webp",
                alt: "[Descripción Imagen]",
                description: '[ej: Degradado simple]',
                category: 'Degradado'
            },
            {
                src: "/images/galeria/3.webp",
                alt: "[Descripción Imagen]",
                description: '[ej: Degradado con textura]',
                category: 'Degradado'
            },
            {
                src: "/images/galeria/4.webp",
                alt: "[Descripción Imagen]",
                description: '[ej: Rapado, con degradado sutil',
                category: 'Rapado'
            },
            {
                src: "/images/galeria/5.webp",
                alt: "[Descripción Imagen]",
                description: '[ej: Trenzado con lados rapados]',
                category: 'Trenzado'
            },
            {
                src: "/images/galeria/6.webp",
                alt: "[Descripción Imagen]",
                description: '[ej: Mohicano texturizado]',
                category: 'Mohicano'
            },
            {
                src: "/images/galeria/7.webp",
                alt: "[Descripción Imagen]",
                description: '[ej: Degradado simple con raya]',
                category: 'Degradado'
            },
            {
                src: "/images/galeria/8.webp",
                alt: "[Descripción Imagen]",
                description: '[ej: Degradado, con pelo texturizado]',
                category: 'Degradado'
            },
        ]
    },
    reviews: {
        badge: '[COMMUNITY]',
        title: '[LO QUE DICEN DE NOSOTROS]',
        desc: '[DESCRIPCIÓN REVIEWS]',
        items: [
            {
                content: '[CONTENIDO REVIEW] ej: Buscaba un cambio radical y me asesoraron genial. El Mullet ha quedado clavado, con un degradado súper limpio en las patillas.',
                servicio: '[SERVICIO REVIEW]',
                user: '[Andres Iniesta]',
                rating: 5,
                icon: 'User'
            },
            {
                content: '[CONTENIDO REVIEW] ej: Buscaba un cambio radical y me asesoraron genial. El Mullet ha quedado clavado, con un degradado súper limpio en las patillas.',
                servicio: '[SERVICIO REVIEW]',
                user: '[Andres Iniesta]',
                rating: 4,
                icon: 'User'
            },
            {
                content: '[CONTENIDO REVIEW] ej: Buscaba un cambio radical y me asesoraron genial. El Mullet ha quedado clavado, con un degradado súper limpio en las patillas.',
                servicio: '[SERVICIO REVIEW]',
                user: '[Andres Iniesta]',
                rating: 5,
                icon: 'User'
            },
            {
                content: '[CONTENIDO REVIEW] ej: Buscaba un cambio radical y me asesoraron genial. El Mullet ha quedado clavado, con un degradado súper limpio en las patillas.',
                servicio: '[SERVICIO REVIEW]',
                user: '[Andres Iniesta]',
                rating: 4,
                icon: 'User'
            },
            {
                content: '[CONTENIDO REVIEW] ej: Buscaba un cambio radical y me asesoraron genial. El Mullet ha quedado clavado, con un degradado súper limpio en las patillas.',
                servicio: '[SERVICIO REVIEW]',
                user: '[Andres Iniesta]',
                rating: 5,
                icon: 'User'
            },
            {
                content: '[CONTENIDO REVIEW] ej: Buscaba un cambio radical y me asesoraron genial. El Mullet ha quedado clavado, con un degradado súper limpio en las patillas.',
                servicio: '[SERVICIO REVIEW]',
                user: '[Andres Iniesta]',
                rating: 5,
                icon: 'User'
            },
            {
                content: '[CONTENIDO REVIEW] ej: Buscaba un cambio radical y me asesoraron genial. El Mullet ha quedado clavado, con un degradado súper limpio en las patillas.',
                servicio: '[SERVICIO REVIEW]',
                user: '[Andres Iniesta]',
                rating: 4,
                icon: 'User'
            },
            {
                content: '[CONTENIDO REVIEW] ej: Buscaba un cambio radical y me asesoraron genial. El Mullet ha quedado clavado, con un degradado súper limpio en las patillas.',
                servicio: '[SERVICIO REVIEW]',
                user: '[Andres Iniesta]',
                rating: 5,
                icon: 'User'
            },
        ]
    },
    contacto: {
        metadata: {
            title: 'Reservar Cita | [NOMBRE] Peluquería en [PUEBLO]',
            description: 'Te esperamos anisosos en [NOMBRE], encuentranos en [DIRECCIÓN ej: Calle...]. Reserva tu cita aquí ->'
        },
        badge: "GET IN TOUCH",
        title: "Reserva \nContacto", // Usamos \n para el salto de línea
        desc: "[DESCRIPCIÓN CONTACTO] ej: Estamos en el corazón de la ciudad listos para cambiar tu imagen. Reserva tu cita o escríbenos. Reserva tu cita aquí ->",
        formAction: "https://formspree.io/f/[tu-codigo-aqui]",
        formOptions: [
            "[Corte de Pelo]",
            "[Arreglo de Barba]",
            "[Tinte / Color]",
            "[Pack Completo]",
            "[Consulta / Otros]"
        ],
        mapEmbedUrl: "[https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3083...]",
        direccion: {
            calle: '[C/Local Numero Local 23]',
            cp: 46600,
            municipyCity: '[Alzira, Valencia]'
        },
        info: {
            horario: {
                entresemana: '[Lun - Vie: 10:00 - 20:00]',
                sabado: '[Sabado: 10:00 - 20:00]',
                domingo: '[Domingo: 10:00 - 20:00]',
                sabadoYDomingo: '[Sab y Dom: 10:00 - 20:00]',
            },
            contacto: {
                telefono: '[+34 600 60 60 60]',
                links: {
                    instagram: {
                        icon: 'Instagram',
                        href: 'https://instagram.com/INSTAGRAM NEGOCIO'
                    },
                    phone: {
                        icon: 'Phone',
                        href: 'https://wa.me/34Número de teléfono?text=Hola%20[Nombre del negocio]%quería%20reservar%cita'
                    }
                }
            }
        },
        iframe: 'ej: https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8055.387038917681!2d-0.4179848061566288!3d39.356681653906115!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd604d00336c8bb5%3A0x265a3a0c7ddaaf23!2sAvinguda%20de%20Llu%C3%ADs%20Vives%2C%2014%2C%2046460%20Silla%2C%20Val%C3%A8ncia!5e0!3m2!1ses!2ses!4v1767958245944!5m2!1ses!2ses'
    },
    footer: {
        logo: '[LOGO]',
        desc: '[DESCRIPCIÓN FOOTER] ej: Tu peluquería de confianza en Silla (Valencia). Fusionamos la barbería clásica con el estilo más actual. Cuidamos tu imagen y definimos tu estilo.',
        socialLinks: [
            { icon: "Instagram", href: "https://instagram.com/celdabarber" },
            { icon: "Phone", href: "https://wa.me/[34Número de teléfono]?text=Hola%20[Nombre del negocio]%quería%20reservar%cita" }
        ],

        // Secciones Manuales (Explora)
        navSections: [
            {
                title: "Explora",
                items: [
                    { text: "Inicio", href: "/" },
                    { text: "Servicios", href: "/servicios" },
                    { text: "Galería", href: "/galeria" },
                    { text: "Sobre Nosotros", href: "/sobre-nosotros" },
                    { text: "Cita Previa", href: "https://wa.me/[34Número de teléfono]?text=Hola%20[Nombre del negocio]%quería%20reservar%cita" }
                ]
            }
        ],
        copyright: '[AÑO - NOMBRE]'
    },
    sobreNosotros: {
        metadata: {
            title: 'Sobre Nosotros | [NOMBRE] Peluquería en [PUEBLO]',
            description: 'Conoce quien hay detras de [NOMBRE], somos un equipo comprometido en sacar tu mejor versión, encuentranos en [DIRECCION ej: Calle...]. Reserva tu cita aquí ->'
        },
        badge: "Desde 2025",
        title: {
            normal: "Más que una",
            highlight: "Barbería"
        },
        desc: {
            part1: "[Celda Barber nació en las calles de Silla con una misión clara: romper con lo clásico. No buscábamos ser otra peluquería más, queríamos crear un espacio de peluquería renovado.[",
            part2: "[Entendemos el corte de pelo como una forma de expresión. Ya sea un Low Fade pulido o un diseño Freestyle agresivo, nuestro objetivo es que tu imagen hable por ti antes de que tú digas una palabra.]"
        },
        quote: "[Precisión milimétrica, ambiente acogedor y trato de familia. Eso es lo que somos.]",
        image: "/images/home/salon-belleza-hero.webp",
        stats: [ //* AJUSTAR
            { label: "Años de Experiencia", value: 1, suffix: "+", icon: 'Trophy' },
            { label: "Clientes Satisfechos", value: 1000, suffix: "+", icon: 'Users' },
            { label: "Cortes Realizados", value: 2000, suffix: "", icon: 'Scissors' },
            { label: "Valoración Google", value: 4.9, suffix: "/5", icon: 'Star' },
        ],
        teamTitle: {
            normal: "NUESTRO",
            highlight: "EQUIPO"
        },
        // AQUÍ ESTÁ EL CAMBIO: Simplificado a un único texto editable
        teamDesc: 'Conoce a los artistas detrás de las navajas. Especialistas en cortes modernos y comprometidos con brindarte el mejor servicio posible.',
        team: [
            {
                id: 1,
                name: "ej: Álvaro Celda",
                role: "ej: Founder & CEO",
                image: "/images/sobre-nosotros/1.webp",
            },
            {
                id: 2,
                name: "[Nombre]",
                role: "[ROL]",
                image: "/images/sobre-nosotros/2.webp",
            },
            {
                id: 3,
                name: "[Nombre]",
                role: "[ROL]",
                image: "/images/sobre-nosotros/3.webp",
            },
        ],
    },
    design: {
        background: 'barberia-urbana',
        paleta: 'violet',
        typography: 'barberiaUrbana'
    }
}