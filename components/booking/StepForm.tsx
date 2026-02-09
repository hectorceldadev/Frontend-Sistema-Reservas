'use client';

import { useState } from 'react';
import { User, Phone, Mail, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';
import { Booking } from './BookingModal';
import { clientFormSchema } from '@/lib/schemas'; // Importamos el esquema
import { z } from 'zod';

interface StepFormProps {
  booking: Booking;
  setBooking: React.Dispatch<React.SetStateAction<Booking>>;
}

export default function StepForm({ booking, setBooking }: StepFormProps) {
  
  // Estado local para guardar los errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Valores actuales (o vacíos por defecto)
  const { name = '', phone = '', email = '', comment = '' } = booking.client || {};

  // Función para validar un campo individualmente
  // Función para validar un campo individualmente
  const validateField = (field: 'name' | 'email' | 'phone' | 'comment', value: string) => {
    // 1. Extraemos la regla específica del campo
    const fieldSchema = clientFormSchema.pick({ [field]: true } as any);
    
    // 2. Usamos safeParse en lugar de parse. NO explota, devuelve un objeto result.
    const result = fieldSchema.safeParse({ [field]: value });
    
    if (!result.success) {
      // Si falla, accedemos a .issues (es la propiedad nativa, más segura que .errors)
      const errorMessage = result.error.issues[0].message;
      
      setErrors(prev => ({ ...prev, [field]: errorMessage }));
    } else {
      // Si pasa la validación, borramos el error de ese campo si existía
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name: fieldName, value } = e.target;
    
    // 1. Actualizamos el estado global de la reserva
    setBooking({
      ...booking,
      client: {
        ...(booking.client || { name: '', phone: '', email: '', comment: '' }),
        [fieldName]: value
      }
    });

    // 2. (Opcional) Si quieres validar en tiempo real mientras escribe, descomenta esto:
    // validateField(fieldName as any, value);
  };

  // Validamos cuando el usuario sale del input (onBlur)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name: fieldName, value } = e.target;
      validateField(fieldName as any, value);
  }

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
                <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.name ? 'text-red-500' : 'text-muted group-focus-within:text-primary'}`} />
                <input 
                    type="text" 
                    name="name"
                    value={name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: Alex García"
                    className={`w-full bg-background-secondary border rounded-xl py-3 pl-10 pr-4 outline-none transition-all text-foreground placeholder:text-muted/50 
                        ${errors.name 
                            ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                            : 'border-foreground/10 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                        }`}
                />
            </div>
            {errors.name && <p className="text-xs text-red-500 flex items-center gap-1 ml-1 animate-in slide-in-from-left-2"><AlertCircle size={10}/> {errors.name}</p>}
        </div>

        {/* TELÉFONO */}
        <div className="space-y-1.5">
            <label className="text-sm font-bold text-foreground ml-1">Teléfono móvil *</label>
            <div className="relative group">
                <Phone size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.phone ? 'text-red-500' : 'text-muted group-focus-within:text-primary'}`} />
                <input 
                    type="tel" 
                    name="phone"
                    value={phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: 600 123 456"
                    className={`w-full bg-background-secondary border rounded-xl py-3 pl-10 pr-4 outline-none transition-all text-foreground placeholder:text-muted/50 
                        ${errors.phone 
                            ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                            : 'border-foreground/10 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                        }`}
                />
            </div>
            {errors.phone && <p className="text-xs text-red-500 flex items-center gap-1 ml-1 animate-in slide-in-from-left-2"><AlertCircle size={10}/> {errors.phone}</p>}
        </div>

        {/* EMAIL */}
        <div className="space-y-1.5">
            <label className="text-sm font-bold text-foreground ml-1">Email *</label>
            <div className="relative group">
                <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-500' : 'text-muted group-focus-within:text-primary'}`} />
                <input 
                    type="email" 
                    name="email"
                    value={email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="nombre@ejemplo.com"
                    className={`w-full bg-background-secondary border rounded-xl py-3 pl-10 pr-4 outline-none transition-all text-foreground placeholder:text-muted/50 
                        ${errors.email 
                            ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                            : 'border-foreground/10 focus:ring-2 focus:ring-primary/20 focus:border-primary'
                        }`}
                />
            </div>
            {errors.email && <p className="text-xs text-red-500 flex items-center gap-1 ml-1 animate-in slide-in-from-left-2"><AlertCircle size={10}/> {errors.email}</p>}
        </div>

        {/* COMENTARIOS */}
        <div className="space-y-1.5">
            <label className="text-sm font-bold text-foreground ml-1">¿Algún comentario? <span className="text-muted font-normal text-xs">(Opcional)</span></label>
            <div className="relative group">
                <MessageSquare size={18} className="absolute left-3 top-4 text-muted group-focus-within:text-primary transition-colors" />
                <textarea 
                    name="comment"
                    value={comment}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={3}
                    placeholder="Ej: Tengo la piel sensible..."
                    className="w-full bg-background-secondary border border-foreground/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted/50 resize-none"
                />
            </div>
            {errors.comment && <p className="text-xs text-red-500 flex items-center gap-1 ml-1"><AlertCircle size={10}/> {errors.comment}</p>}
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