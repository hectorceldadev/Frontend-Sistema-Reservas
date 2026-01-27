'use client'

import { DayPicker } from "react-day-picker"
import { format, getDay, addMinutes, parseISO, startOfDay, endOfDay, isSameDay } from "date-fns"
import { es } from "date-fns/locale" 
import "react-day-picker/dist/style.css"
import { cn } from "@/lib/utils"
import { Clock, Loader2 } from "lucide-react"
import { useRef, useEffect } from "react"
import { Booking, BusySlot, Profile, StaffSchedule } from "./BookingModal"

interface StepDateProps {
    booking: Booking;
    setBooking: (data: Booking) => void;
    schedules: StaffSchedule[]
    timeSlots: BusySlot[] 
    staffList: Profile[]
    isLoading: boolean
}

const StepDate = ({ booking, setBooking, schedules, timeSlots, staffList, isLoading }: StepDateProps) => {
    
    const timeSectionRef = useRef<HTMLDivElement>(null);
    
    // Helper: Convertir Date a minutos totales del día (0 - 1440)
    const getMinutesFromTime = (date: Date) => {
        return date.getHours() * 60 + date.getMinutes();
    }

    const generateTimeSlots = () => {
        if (!booking.date) return []

        // 1. CALCULAR DURACIÓN TOTAL DEL SERVICIO (El bloque que queremos encajar)
        const serviceDuration = booking.services.reduce((acc, s) => acc + s.duration, 0);

        const dayOfWeek = getDay(booking.date)
        const slots: string[] = []

        // 2. FILTRAR EMPLEADOS
        let activeSchedules: StaffSchedule[] = []
        if (booking.staff?.id === 'any') {
            const realStaffIds = staffList.filter(s => s.id !== 'any').map(s => s.id)
            activeSchedules = schedules.filter(s => 
                realStaffIds.includes(s.staff_id) && 
                s.day_of_week === dayOfWeek && 
                s.is_working
            )
        } else if (booking.staff) {
            activeSchedules = schedules.filter(s => 
                s.staff_id === booking.staff!.id &&
                s.day_of_week === dayOfWeek &&
                s.is_working
            )
        }

        if (activeSchedules.length === 0) return []

        // 3. PREPARAR VARIABLES DE TIEMPO ACTUAL (Para no mostrar el pasado)
        const now = new Date();
        const isToday = isSameDay(booking.date, now);
        // Le sumamos un "buffer" opcional (ej: 15 min) para que no reserven AHORA mismo si no quieres
        const currentMinutesNow = getMinutesFromTime(now); 

        // BUCLE DEL DÍA
        let currentTime = startOfDay(booking.date);
        const endTime = endOfDay(booking.date);

        while (currentTime < endTime) {
            const timeString = format(currentTime, 'HH:mm');
            
            // DEFINIMOS EL RANGO PROPUESTO (CANDIDATO)
            const startMinutes = getMinutesFromTime(currentTime); // Ej: 09:30 (570)
            const endMinutes = startMinutes + serviceDuration;    // Ej: 09:30 + 45min = 10:15 (615)

            // VALIDACIÓN 1: ¿ESTÁ EN EL PASADO?
            // Si es hoy Y la hora de inicio es anterior a ahora mismo -> DESCARTAR
            if (isToday && startMinutes < currentMinutesNow) {
                currentTime = addMinutes(currentTime, 30);
                continue;
            }

            // VALIDACIÓN 2: ¿CABE EN EL HORARIO DE ALGÚN EMPLEADO?
            const isSlotAvailable = activeSchedules.some(schedule => {
                
                // --- RANGOS DEL EMPLEADO ---
                const [startH, startM] = schedule.start_time.split(':').map(Number);
                const [endH, endM] = schedule.end_time.split(':').map(Number);
                const shiftStart = startH * 60 + startM;
                const shiftEnd = endH * 60 + endM;

                // A. LIMITE DE JORNADA
                // ¿Empiezo antes de que abra? O ¿Termino después de que cierre?
                // Aquí solucionamos el "No puedes reservar 1h antes del cierre"
                if (startMinutes < shiftStart || endMinutes > shiftEnd) return false;

                // B. DESCANSOS
                if (schedule.break_start && schedule.break_end) {
                    const [bStartH, bStartM] = schedule.break_start.split(':').map(Number);
                    const [bEndH, bEndM] = schedule.break_end.split(':').map(Number);
                    const breakStart = bStartH * 60 + bStartM;
                    const breakEnd = bEndH * 60 + bEndM;

                    // FÓRMULA DE INTERSECCIÓN: (InicioA < FinB) Y (FinA > InicioB)
                    // Si mi cita termina después de que empiece el descanso 
                    // Y mi cita empieza antes de que termine el descanso... CHOCAN.
                    if (startMinutes < breakEnd && endMinutes > breakStart) return false;
                }

                // C. CITAS OCUPADAS (Booking Overlap)
                const hasConflict = timeSlots.some(busy => {
                    const busyStart = parseISO(busy.start_time);
                    const busyEnd = parseISO(busy.end_time);
                    const busyStartMins = getMinutesFromTime(busyStart);
                    const busyEndMins = getMinutesFromTime(busyEnd);

                    // Misma fórmula de intersección
                    // Ej: Mi cita (09:30 - 10:15) vs Cita Ocupada (10:00 - 10:30)
                    // 09:30 < 10:30 (TRUE) && 10:15 > 10:00 (TRUE) -> ¡CHOQUE! 💥
                    return (startMinutes < busyEndMins && endMinutes > busyStartMins);
                });

                if (hasConflict) return false;

                return true; // Si pasa todos los filtros, este empleado sirve
            });

            if (isSlotAvailable) {
                slots.push(timeString);
            }

            currentTime = addMinutes(currentTime, 30);
        }
        
        return slots;
    }

    const availableSlots = generateTimeSlots();

    // HANDLERS
    const handleDaySelect = (date: Date | undefined) => {
        setBooking({ ...booking, date: date, time: null });
    }

    const handleTimeSelect = (timeSlot: string) => {
        setBooking({ ...booking, time: timeSlot });
    }

    useEffect(() => {
        if (booking.date) {
            setTimeout(() => {
                timeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [booking.date]);

    let footer = <p className="mt-4 text-muted font-bold text-center text-sm">Escoge una fecha</p>

    if (booking.date && !booking.time) {
        footer = <p className="mt-4 text-foreground font-bold text-center text-sm">Ahora escoge una hora</p>
    } else if (booking.date && booking.time) {
        footer = (
            <p className="mt-4 text-foreground font-bold text-center text-sm">
                Cita para el <span className="text-primary capitalize">{format(booking.date, 'EEEE d', { locale: es })}</span> a las <span className="text-primary">{booking.time}</span>
            </p>
        )
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 stagger-container">
            <div className="flex flex-col items-start">
                <h3 className="text-foreground font-bold text-xl">¿Cuándo nos vemos?</h3>
                <p className="text-muted text-md">Selecciona el día y la hora.</p>
            </div>

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

            {booking.date && (
                <div 
                    ref={timeSectionRef} 
                    className="animate-in slide-in-from-top-2 fade-in duration-300 scroll-mt-24"
                >
                    <div className="flex items-center gap-2 mb-3 text-foreground/80">
                        <Clock size={18} className="text-primary" />
                        <span className="font-bold text-sm">Horas disponibles</span>
                    </div>
                    
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 size={32} className="animate-spin text-muted" />
                        </div>
                    ) : (
                        availableSlots.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2">
                                {availableSlots.map((slot) => {
                                    const isSelected = booking.time === slot;
                                    return (
                                        <button
                                            key={slot}
                                            onClick={() => handleTimeSelect(slot)}
                                            className={cn(
                                                "py-2 px-1 rounded-lg text-sm font-semibold border transition-all duration-200",
                                                "hover:scale-105 active:scale-95",
                                                isSelected 
                                                    ? "bg-primary border-primary text-white shadow-md" 
                                                    : "bg-background-secondary border-transparent text-foreground hover:border-primary/30"
                                            )}
                                        >
                                            {slot}
                                        </button>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="p-4 bg-muted/10 border border-muted/20 rounded-xl text-center">
                                <p className="text-sm font-medium text-muted">
                                    No hay huecos disponibles para este día.
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