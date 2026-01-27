'use client';

import { CreditCard, Store, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Booking, Service } from './BookingModal';

interface StepPaymentProps {
  booking: Booking;
  setBooking: (data: Booking) => void;
}

export default function StepPayment({ booking, setBooking }: StepPaymentProps) {
  
  const handleSelect = (method: 'card' | 'venue') => {
    setBooking({ ...booking, paymentMethod: method });
  };

  const totalPrice = booking.services.reduce((total: number, s: Service) => total + s.price, 0);

  return (
    <div className="space-y-4 animate-in slide-in-from-right-8 fade-in duration-500 pb-4 stagger-container">
      
      {/* HEADER */}
      <div className="flex flex-col items-start">
        <h3 className="text-foreground font-bold font-title text-xl">Método de pago</h3>
        <p className="text-muted text-md">Elige cómo prefieres abonar el servicio.</p>
      </div>

      {/* RESUMEN DEL TOTAL */}
      <div className="bg-primary px-4 py-1 rounded-2xl flex justify-between items-center border border-foreground/5">
        <span className="text-foreground text-sm font-medium">Total a pagar</span>
        <span className="text-lg font-bold font-title text-foreground">{totalPrice}€</span>
      </div>

      {/* OPCIONES DE PAGO */}
      <div className="grid grid-cols-1 gap-4">
        
        <button
          onClick={() => handleSelect('card')}
          className={cn(
            "relative flex items-center gap-4 p-4 md:p-5 rounded-2xl border transition-all duration-300 text-left group",
            "hover:scale-[1.01] hover:shadow-md",
            booking.paymentMethod === 'card'
              ? "border-primary bg-primary/5 ring ring-primary/20"
              : "bg-background-secondary border border-foreground hover:border-foreground/10"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0",
            booking.paymentMethod === 'card' ? "bg-primary text-background" : "bg-foreground/5 text-muted-foreground group-hover:bg-foreground/10"
          )}>
            <CreditCard size={24} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
                <h4 className={cn("font-bold font-title text-lg", booking.paymentMethod === 'card' ? "text-primary" : "text-foreground")}>
                    Pago con Tarjeta
                </h4>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Seguro
                </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
                Reserva tu hueco al instante. Procesado seguro vía Stripe.
            </p>
          </div>

          {/* Radio Button Visual */}
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
            booking.paymentMethod === 'card' ? "border-primary" : "border-muted"
          )}>
             {booking.paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
          </div>
        </button>

        {/* OPCIÓN 1: EN EL LOCAL */}
        <button
          onClick={() => handleSelect('venue')}
          className={cn(
            "relative flex items-center gap-4 p-4 md:p-5 rounded-2xl border transition-all duration-300 text-left group",
            "hover:scale-[1.01] hover:shadow-md",
            booking.paymentMethod === 'venue'
              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
              : "bg-background-secondary border-foreground hover:border-foreground/10"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0",
            booking.paymentMethod === 'venue' ? "bg-primary text-background" : "bg-foreground/5 text-muted-foreground group-hover:bg-foreground/10"
          )}>
            <Store size={24} />
          </div>
          
          <div className="flex-1">
            <h4 className={cn("font-bold font-title text-lg", booking.paymentMethod === 'venue' ? "text-primary" : "text-foreground")}>
                Pagar en el local
            </h4>
            <p className="text-xs text-muted leading-relaxed">
                Paga en efectivo o tarjeta una vez termine tu corte. Sin cargos por adelantado.
            </p>
          </div>

          {/* Radio Button Visual */}
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
            booking.paymentMethod === 'venue' ? "border-primary" : "border-muted"
          )}>
             {booking.paymentMethod === 'venue' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
          </div>
        </button>

        {/* OPCIÓN 2: ONLINE (TARJETA) */}
        

      </div>

      <div className="flex items-center justify-center gap-2  opacity-60">
        <ShieldCheck size={14} className="text-muted" />
        <span className="text-[10px] text-muted uppercase tracking-wider font-medium">Pagos encriptados y seguros</span>
      </div>

    </div>
  );
}