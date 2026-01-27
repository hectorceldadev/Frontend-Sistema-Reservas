'use client';

import { User, Phone, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import { Booking } from './BookingModal';

interface StepFormProps {
  booking: Booking;
  setBooking: (data: Booking) => void;
}

export default function StepForm({ booking, setBooking }: StepFormProps) {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setBooking({
      ...booking,
      client: {
        ...(booking.client || { name: '', phone: '', email: '', comment: '' }),
        [name]: value
      }
    });
  };

  const { name = '', phone = '', email = '', comment = '' } = booking.client || {};

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500 pb-4">
      
      {/* HEADER */}
      <div className="flex flex-col items-start stagger-container">
        <h3 className="text-foreground font-bold font-title text-xl">Tus datos</h3>
        <p className="text-muted text-md">Necesarios para enviarte la confirmación.</p>
      </div>

      {/* FORMULARIO */}
      <div className="space-y-4 stagger-container">
        
        {/* NOMBRE */}
        <div className="space-y-1.5">
            <label className="text-sm font-bold text-foreground ml-1">Nombre completo *</label>
            <div className="relative group">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                <input 
                    type="text" 
                    name="name"
                    value={name}
                    onChange={handleChange}
                    placeholder="Ej: Alex García"
                    className="w-full bg-background-secondary border border-foreground/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted/50"
                />
            </div>
        </div>

        {/* TELÉFONO */}
        <div className="space-y-1.5">
            <label className="text-sm font-bold text-foreground ml-1">Teléfono móvil *</label>
            <div className="relative group">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                <input 
                    type="tel" 
                    name="phone"
                    value={phone}
                    onChange={handleChange}
                    placeholder="Ej: 600 123 456"
                    className="w-full bg-background-secondary border border-foreground/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted/50"
                />
            </div>
        </div>

        {/* EMAIL (AHORA OBLIGATORIO) */}
        <div className="space-y-1.5">
            <label className="text-sm font-bold text-foreground ml-1">Email *</label>
            <div className="relative group">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                <input 
                    type="email" 
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="nombre@ejemplo.com" // Placeholder ayuda al usuario
                    className="w-full bg-background-secondary border border-foreground/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted/50"
                />
            </div>
        </div>

        {/* COMENTARIOS (Opcional) */}
        <div className="space-y-1.5">
            <label className="text-sm font-bold text-foreground ml-1">¿Algún comentario? <span className="text-muted font-normal text-xs">(Opcional)</span></label>
            <div className="relative group">
                <MessageSquare size={18} className="absolute left-3 top-4 text-muted group-focus-within:text-primary transition-colors" />
                <textarea 
                    name="comment"
                    value={comment}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Ej: Tengo la piel sensible..."
                    className="w-full bg-background-secondary border border-foreground/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted/50 resize-none"
                />
            </div>
        </div>

      </div>

      {/* AVISO LEGAL */}
      <div className="flex items-start gap-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
          <ShieldCheck size={16} className="text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted leading-relaxed">
              Te enviaremos los detalles de la reserva a tu correo. No hacemos spam.
          </p>
      </div>

      {/* Espaciador para teclado móvil */}
      <div className="h-64 w-full md:hidden"></div> 

    </div>
  );
}