'use client'

import { DayPicker } from "react-day-picker"
import { format, getDay, addMinutes, parseISO, startOfDay, endOfDay, isSameDay } from "date-fns"
import { es } from "date-fns/locale" 
import "react-day-picker/dist/style.css"
import { cn } from "@/lib/utils"
import { AlertCircle, Clock, Loader2 } from "lucide-react"
import { useRef, useEffect, useState } from "react"
import { Booking } from "./BookingModal"
import { SITE_CONFIG } from "@/config"
import { toast } from "sonner"

interface StepDateProps {
    booking: Booking;
    setBooking: (data: Booking) => void;
}

const StepDate = ({ booking, setBooking }: StepDateProps) => {
    
    const [ slots, setSlots ] = useState<string[]>([])
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const [ error, setError ] = useState<string | null>(null)

    const timeSectionRef = useRef<HTMLDivElement>(null);
    const businessId = SITE_CONFIG.supabaseData.businessId
    
    useEffect(() => {
        const fetchSlots = async () => {
            if (!booking.date || !booking.staff) return

            setIsLoading(true)
            setError(null)
            setSlots([])

            try {
                const dateString = format(booking.date, 'yyyy-MM-dd')
                const staffId = booking.staff.id
                const duration = booking.services.reduce((acc, s) => acc + s.duration, 0)

                const params = new URLSearchParams({
                    date: dateString,
                    staffId: staffId,
                    duration: duration.toString(),
                    businessId: businessId
                })

                const response = await fetch(`/api/bookings/availability?${params.toString()}`)
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Error al obtener horarios')
                }

                setSlots(data.slots || [])

                setTimeout(() => {
                    timeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }, 100)
            } catch (error) {
                console.error(error)
                setError('No pudimos cargar los horarios. Intentalo de nuevo')
                toast.error('Error de conexión al buscar los horarios')
            } finally {
                setIsLoading(false)
            }
        }
        fetchSlots()
    }, [booking.date, booking.staff, businessId, booking.services])
    

    // HANDLERS
    const handleDaySelect = (date: Date | undefined) => {
        setBooking({ ...booking, date: date, time: null });
    }

    const handleTimeSelect = (timeSlot: string) => {
        setBooking({ ...booking, time: timeSlot });
    }

    let footer = <p className="mt-4 text-muted font-bold text-center text-sm">Escoge una fecha</p>

    if (booking.date && !booking.time) {
        footer = <p className="mt-4 text-foreground font-bold text-center text-sm ">Ahora escoge una hora</p>
    } else if (booking.date && booking.time) {
        footer = (
            <p className="mt-4 text-foreground font-bold text-center text-sm">
                Cita para el <span className="text-primary capitalize">{format(booking.date, 'EEEE d', { locale: es })}</span> a las <span className="text-primary">{booking.time}</span>
            </p>
        )
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 stagger-container">
            
            {/* Título */}
            <div className="flex flex-col items-start">
                <h3 className="text-foreground font-bold text-xl">¿Cuándo nos vemos?</h3>
                <p className="text-muted text-md">Selecciona el día y la hora.</p>
            </div>

            {/* Calendario */}
            <div className="bg-background-secondary p-4 rounded-xl shadow-lg ring ring-foreground/10 flex justify-center">
                <DayPicker
                    mode="single"
                    selected={booking.date}
                    onSelect={handleDaySelect}
                    footer={footer}
                    showOutsideDays
                    locale={es} 
                    disabled={{ before: startOfDay(new Date()) }}
                    modifiersClassNames={{
                        selected: 'bg-primary text-white hover:bg-primary/90 font-bold', 
                        today: 'text-primary font-bold border-primary', 
                    }}
                    classNames={{
                        chevron: 'fill-primary',
                        day: "hover:bg-primary-light/20 rounded-md transition-colors text-foreground font-title",
                        day_disabled: "text-muted opacity-30 hover:bg-transparent cursor-not-allowed", 
                        month: 'text-foreground font-bold capitalize font-title',
                        caption: 'flex justify-center pt-1 relative items-center mb-2',
                        button_next: 'text-primary',
                        button_previous: 'text-primary',
                    }}
                />
            </div>

            {/* Sección de Horas (Solo visible si hay fecha) */}
            {booking.date && (
                <div 
                    ref={timeSectionRef} 
                    className="animate-in slide-in-from-top-2 fade-in duration-300 scroll-mt-32"
                >
                    <div className="flex items-center gap-2 mb-3 text-foreground/80">
                        <Clock size={18} className="text-primary" />
                        <span className="font-bold text-sm">Horas disponibles</span>
                    </div>
                    
                    {/* ESTADO: CARGANDO */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <Loader2 size={32} className="animate-spin text-primary" />
                            <span className="text-xs text-muted">Buscando huecos libres...</span>
                        </div>
                    ) : error ? (
                         /* ESTADO: ERROR */
                        <div className="flex flex-col items-center justify-center py-6 gap-2 text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">
                            <AlertCircle size={24} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    ) : (
                         /* ESTADO: RESULTADOS */
                        slots.length > 0 ? (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                {slots.map((slot) => {
                                    const isSelected = booking.time === slot;
                                    return (
                                        <button
                                            key={slot}
                                            onClick={() => handleTimeSelect(slot)}
                                            className={cn(
                                                "py-2.5 px-1 rounded-xl text-sm font-bold border transition-all duration-200",
                                                "hover:scale-105 active:scale-95",
                                                isSelected 
                                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" 
                                                    : "bg-background-secondary border-transparent text-foreground hover:border-primary/30 hover:bg-background-secondary/80"
                                            )}
                                        >
                                            {slot}
                                        </button>
                                    )
                                })}
                            </div>
                        ) : (
                             /* ESTADO: SIN HUECOS */
                            <div className="p-6 bg-muted/5 border border-dashed border-muted/30 rounded-xl text-center">
                                <p className="text-sm font-medium text-muted">
                                    No quedan huecos disponibles para este día. <br/> Por favor, prueba otra fecha.
                                </p>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    )
}

export default StepDate