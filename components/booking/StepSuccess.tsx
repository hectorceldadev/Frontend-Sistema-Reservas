'use client';

import { Check, ArrowRight } from 'lucide-react'; // Quitamos imports no usados
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Booking } from './BookingModal';
import { generateGoogleCalendarUrl, downloadIcsFile } from '@/lib/calendar';
import Link from 'next/link';

interface StepSuccessProps {
  booking: Booking;
  onClose: () => void;
}

export default function StepSuccess({ booking, onClose }: StepSuccessProps) {

  return (
    <div className="flex flex-col h-full overflow-hidden stagger-container">
      
      {/* 1. HEADER (Más aireado) */}
      <div className="text-center pt-8 pb-4 shrink-0">
        <div className="flex justify-center mb-4">
           <div className="h-16 w-16 bg-foreground text-background rounded-full flex items-center justify-center shadow-xl animate-in zoom-in duration-300">
             <Check size={32} strokeWidth={3} />
           </div>
        </div>
        <h2 className="text-3xl font-bold font-title text-foreground leading-none mb-2">Confirmada</h2>
        <p className="text-muted text-sm px-6">
          Hemos enviado el ticket a tu email.
        </p>
      </div>

      {/* 2. TICKET (Más limpio y espacioso) */}
      {/* Usamos my-auto para que se centre verticalmente si sobra espacio */}
      <div className="mx-5 my-auto bg-background-secondary border border-foreground/10 rounded-2xl p-5 shrink-0 shadow-sm">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-foreground/20">
           <div className="text-left">
              <p className="text-[11px] text-muted uppercase font-bold tracking-wider mb-1">Fecha</p>
              <p className="font-semibold text-foreground text-base capitalize">
                 {booking.date && format(booking.date, 'EEEE d MMMM', { locale: es })}
              </p>
           </div>
           <div className="text-right">
              <p className="text-[11px] text-muted uppercase font-bold tracking-wider mb-1">Hora</p>
              <p className="font-semibold text-foreground text-base">{booking.time}</p>
           </div>
        </div>
        <div className="flex justify-between items-end">
            <div className="text-left overflow-hidden mr-4">
               <p className="text-[11px] text-muted uppercase font-bold tracking-wider mb-1">Servicio</p>
               <p className="font-medium text-foreground text-sm truncate">{booking.services[0]?.title}</p>
            </div>
            <div className="text-right shrink-0">
               <p className="font-medium text-foreground text-[10px] bg-foreground/20 px-3 py-1.5 rounded-md border border-foreground/10 shadow-sm">
                 Calle Falsa 123
               </p>
            </div>
        </div>
      </div>

      {/* 3. ZONA DE ACCIONES (Más separada) */}
      <div className="mt-auto px-5 pb-8 pt-4 space-y-4">
        
        {/* Grid de Calendarios */}
        <div className="grid grid-cols-2 gap-4">
            <a 
                href={generateGoogleCalendarUrl(booking)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-foreground/20 bg-primary hover:bg-secondary transition-colors text-sm font-bold text-foreground group"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 424 432">
                    <path fill="currentColor" d="M214 186v-1h201q3 12 3 36q0 93-56.5 150.5T213 429q-88 0-150.5-62T0 216T62 65T213 3q87 0 144 57l-57 56q-33-33-86-33q-54 0-92.5 39.5t-38.5 95t38.5 94.5t92.5 39q31 0 55-9.5t37.5-24.5t20.5-29.5t10-27.5H214v-74z"></path>
                 </svg>
                 Google Calendar
            </a>
            <button 
                onClick={() => downloadIcsFile(booking)}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-foreground/20 bg-primary hover:bg-secondary transition-colors text-sm font-bold text-foreground group"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 368 432">
                    <path fill="currentColor" d="M353 146q-21 7-35 32.5T304 229q0 31 16 57.5t43 33.5q-8 27-26.5 55.5T299 418q-16 11-40 11q-16 0-37-8q-18-9-31-9q-10 0-40 12q-18 5-26 5q-24 0-49-20q-36-34-56-81T0 230q0-53 30.5-93.5T108 96q26 0 48 11q17 11 34 11q16 0 31-6q39-16 52-16q35 0 61 23q12 12 19 27zM179 99q0-32 25-63q25-27 61-33q0 38-24 67q-27 29-62 29z"></path>
                 </svg>
                 Apple Calendar
            </button>
        </div>

        {/* Botón Finalizar */}
        <Link
          href='/reserva'
          onClick={onClose}
          className="w-full group bg-foreground text-background-secondary py-3 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md text-md"
        >
          Finalizar 
          <ArrowRight className='group-hover:translate-x-1 transition-transform duration-150' size={18} />
        </Link>
      </div>

    </div>
  );
}