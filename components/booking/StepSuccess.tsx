'use client';

import { Check, Calendar, MapPin, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Booking } from './BookingModal';

interface StepSuccessProps {
  booking: Booking;
  onClose: () => void;
}

export default function StepSuccess({ booking, onClose }: StepSuccessProps) {
  
  // Generar enlace de Google Calendar
  const googleCalendarUrl = () => {
    if (!booking.date || !booking.time) return '#';
    
    // Convertir fecha y hora a formato YYYYMMDDTHHMMSS
    // Esto es simplificado. En producción usarías una librería para manejar zonas horarias.
    const startTime = booking.time.replace(':', ''); 
    const dateStr = format(booking.date, 'yyyyMMdd');
    const startDateTime = `${dateStr}T${startTime}00`;
    const endDateTime = `${dateStr}T${parseInt(startTime) + 100}00`; // +1 hora aprox

    const title = encodeURIComponent("Cita en Barbería Estilo");
    const details = encodeURIComponent(`Servicios: ${booking.services.map((s:any) => s.name).join(', ')}`);
    const location = encodeURIComponent("Calle Falsa 123, Madrid");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${endDateTime}&details=${details}&location=${location}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in-95 duration-500 p-4 stagger-container">
      
      {/* ICONO ANIMADO */}
      <div className="w-20 h-20 bg-foreground rounded-full flex items-center justify-center mb-6 animate-in slide-in-from-bottom-5 delay-100 duration-700">
        <Check size={44} className="text-primary animate-in zoom-in duration-300 delay-300" strokeWidth={3} />
      </div>

      <h2 className="text-3xl font-bold font-title text-foreground mb-2">
        ¡Reserva Confirmada!
      </h2>
      <p className="text-muted text-lg max-w-xs mx-auto mb-8">
        Gracias <span className="text-foreground font-semibold">{booking.client?.name}</span>, revisa tu correo electrónico.
      </p>

      {/* TICKET RESUMEN */}
      <div className="bg-background-secondary w-full max-w-sm rounded-2xl p-6 border border-foreground/5 shadow-sm mb-8 text-left relative overflow-hidden">
        {/* Decoración Ticket (Círculos laterales) */}
        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-background rounded-full" />
        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-background rounded-full" />
        <div className="absolute top-1/2 left-0 right-0 border-t-2 border-dashed border-foreground/10" />

        <div className="space-y-4 pb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Calendar size={20} />
                </div>
                <div>
                    <p className="text-xs text-muted font-bold uppercase">Fecha y Hora</p>
                    <p className="font-bold text-foreground capitalize">
                        {booking.date && format(booking.date, 'EEEE d MMMM', { locale: es })}
                    </p>
                    <p className="text-sm text-foreground/80">
                        a las {booking.time}h
                    </p>
                </div>
            </div>
        </div>

        <div className="space-y-1 pt-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-foreground/5 rounded-lg text-foreground">
                    <MapPin size={20} />
                </div>
                <div>
                     <p className="text-xs text-muted font-bold uppercase">Ubicación</p>
                     <p className="font-bold text-sm text-foreground">Barbería Estilo</p>
                     <p className="text-xs text-muted">Calle Falsa 123, Madrid</p>
                </div>
            </div>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex flex-col w-full max-w-sm gap-2 md:gap-2">
        <a 
            href={googleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-background border-2 border-foreground/10 hover:bg-foreground/5 text-foreground py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
        >
            <Calendar size={18} />
            Añadir a Google Calendar
        </a>

        <button 
            onClick={onClose}
            className="w-full bg-foreground text-background hover:bg-foreground/90 py-3.5 rounded-xl font-bold shadow-lg transition-all"
        >
            Entendido, ¡gracias!
        </button>
      </div>

    </div>
  );
}