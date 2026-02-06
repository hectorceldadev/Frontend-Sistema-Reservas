'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, User, Scissors, MapPin, Wallet } from 'lucide-react'
import { Booking } from './BookingModal'

// --- IMPORTS DE STRIPE (Comentados para el futuro) ---
// import { useEffect, useState } from 'react'
// import { loadStripe } from '@stripe/stripe-js'
// import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
// import { Loader2 } from 'lucide-react'
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StepPaymentProps {
  booking: Booking
  setBooking: (booking: Booking) => void
}

export default function StepPayment({ booking }: StepPaymentProps) {
  
  // Calculamos el total
  const totalDuration = booking.services.reduce((acc, s) => acc + s.duration, 0)
  const totalPrice = booking.services.reduce((acc, s) => acc + s.price, 0)

  // Formateamos fecha para mostrarla bonita
  const formattedDate = booking.date 
    ? format(booking.date, "EEEE d 'de' MMMM", { locale: es }) 
    : ''

  return (
    // AÑADIDO: h-full overflow-hidden para bloquear el scroll
    <div className="h-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 font-regular">
      
      {/* Título */}
      <div className="flex flex-col items-start">
        <h3 className="text-foreground font-bold text-xl font-title">Resumen de tu cita</h3>
        <p className="text-muted text-md">Revisa los datos antes de confirmar.</p>
      </div>

      {/* Tarjeta de Resumen */}
      <div className="bg-background-secondary/50 border border-border rounded-2xl p-5 flex flex-col gap-2 shadow-sm">
        
        {/* Servicios */}
        <div className="flex flex-col gap-3 pb-2 border-b border-border/50">
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                <Scissors size={14} />
                <span>Servicios</span>
            </div>
            {booking.services.map((s) => (
                <div key={s.id} className="flex justify-between items-center text-sm">
                    <span className="text-foreground font-medium">{s.title}</span>
                    <span className="text-muted">{s.price}€</span>
                </div>
            ))}
        </div>

        {/* Detalles Cita */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/50">
            <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
                    <Calendar size={12} /> Fecha
                </span>
                <span className="text-sm font-semibold capitalize text-foreground">
                    {formattedDate}
                </span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
                    <Clock size={12} /> Hora
                </span>
                <span className="text-sm font-semibold text-foreground">
                    {booking.time} ({totalDuration} min)
                </span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
                    <User size={12} /> Profesional
                </span>
                <span className="text-sm font-semibold text-foreground">
                    {booking.staff?.full_name || 'Cualquiera'}
                </span>
            </div>
        </div>

        {/* Método de Pago (Fijo: Local) */}
        <div className="bg-primary/5 rounded-xl p-3 flex items-center justify-between border border-primary/10">
            <div className="flex items-center gap-3">
                <div className="bg-background p-2 rounded-lg text-primary shadow-sm">
                    <MapPin size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">Pago en el local</span>
                    <span className="text-xs text-muted">Pagarás al terminar tu cita</span>
                </div>
            </div>
            <div className="text-primary">
                <Wallet size={18} />
            </div>
        </div>

        {/* Total Final */}
        <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-bold text-foreground">Total a pagar</span>
            <span className="text-2xl font-title font-bold text-primary">{totalPrice}€</span>
        </div>

      </div>
    </div>
  )
}