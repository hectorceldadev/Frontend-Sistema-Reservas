'use client';

import { useState, useEffect, useRef } from 'react';
import { X, CalendarDays, ChevronLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, getDay } from 'date-fns'
import { toast } from 'sonner'; // <--- 1. IMPORTAMOS SONNER

// IMPORTS DE LOS PASOS
import StepService from './StepService';
import StepStaff from './StepStaff';
import StepDate from './StepDate';
import StepForm from './StepForm';
import StepPayment from './StepPayment';
import StepSuccess from './StepSuccess';
import { supabase } from '@/lib/supabase';
import { getServices } from '@/lib/data';
import { ServiceDB } from '@/lib/types/databaseTypes';
import { useBooking } from '@/context/BookingContext';
import { SITE_CONFIG } from '@/config';

export interface Booking {
  services: Service[];
  staff: Profile | null;
  date: Date | undefined;
  time: string | null;
  client: { name: string; phone: string; email: string; comment: string } | null;
  paymentMethod: 'venue' | 'card' | null;
}

export interface Service {
  id: string;
  title: string;
  price: number;
  duration: number;
  short_desc?: string; // Opcional por si viene null
}

export interface Profile {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
}

export interface StaffSchedule {
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  is_working: boolean;
}

export interface BusySlot {
  start_time: string;
  end_time: string;
  staff_id: string
}

interface BookingModalTypes {
  services: ServiceDB[]
}

export default function BookingModal({ services }: BookingModalTypes) {
  const [ step, setStep ] = useState(1)
  const [ isLoading, setIsLoading ] = useState<boolean>(false)

  const [ availableServices ] = useState<ServiceDB[] | []>(services)
  const [ staff, setStaff ] = useState<Profile[] | []>([])

  const [ confirmedCustomerId, setConfirmedCustomerId ] = useState<string | null>(null)

  const { isOpen, openModal, closeModal } = useBooking()
  const businessId = SITE_CONFIG.supabaseData.businessId
  const scrollRef = useRef<HTMLDivElement>(null)
  const TOTAL_STEPS = 5

  // ESTADO GLOBAL DE LA RESERVA
  const [booking, setBooking] = useState<Booking>({
    services: [],
    staff: null,
    date: undefined,
    time: null,
    client: null,
    paymentMethod: 'venue',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('booking_client_info')
      
      if (savedData) {
        try {
          const { name, email, phone } = JSON.parse(savedData)
          setBooking(prev => ({
            ...prev, 
            client: {
              ...prev.client!,
              name: name || '',
              email: email || '',
              phone: phone || '',
              comment: ''
            }
          }))
        } catch (err) {
          console.error('Error leyendo localStorage: ' + err)
        }
      }
    }
  }, [])

  useEffect(() => {

    if (booking.client) {
      const { name, email, phone } = booking.client

      if (name || email || phone) {
        localStorage.setItem('booking_client_info', JSON.stringify({ name, email, phone }))
      }
    }

  }, [booking.client])

  useEffect(() => {

    const fetchStaff = async () => {
      if (!isOpen) return
      try {
        setIsLoading(true)
        const response = await fetch(`/api/staff?businessId=${businessId}`)
        const data = await response.json()

        if (!response.ok) throw new Error(data.error || 'Error cargando staff');

        const staffData = data.staff || []

        if (staffData.length === 1) {
          setStaff(staffData)
          setBooking(prev => ({ ...prev, staff: staffData[0] }))
        } else {
          const anyStaff: Profile = {
            id: 'any',
            full_name: 'Cualquiera',
            role: 'Primer hueco libre'
          }
          setStaff([ anyStaff, ...staffData ])
        }
      } catch (err) {
          console.error('Error cargando staff', err);
          toast.error('Error cargando profesionales');
      } finally {
        setIsLoading(false)
      }
    }
    fetchStaff()
  }, [isOpen, businessId])

  // 1. EFECTO: BLOQUEAR SCROLL DEL BODY CUANDO EL MODAL ESTÁ ABIERTO
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 2. EFECTO: RESETEAR SCROLL AL CAMBIAR DE PASO
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [step]);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleClose = () => {
    closeModal();
    if (step === 6) {
      setTimeout(() => {
        setStep(1);
        setBooking(prev => ({
            services: [],
            staff: null,
            date: undefined,
            time: null,
            client: prev.client, // <--- CLAVE: Mantenemos los datos del cliente
            paymentMethod: null,
        }));
      }, 500)
    }
  };

  // VALIDACIÓN DE CADA PASO
  const canContinue = () => {
    if (step === 1) return booking.services.length > 0;
    if (step === 2) return !!booking.staff;
    if (step === 3) return !!booking.date && !!booking.time;

    // PASO 4: AHORA VALIDAMOS EL EMAIL TAMBIÉN
    if (step === 4) {
      const { name, phone, email } = booking.client || {};
      const hasName = (name?.length ?? 0) > 2;
      const hasPhone = (phone?.length ?? 0) > 6;
      const hasEmail = (email?.length ?? 0) > 3 && email?.includes('@'); // Validación básica de email

      return hasName && hasPhone && hasEmail;
    }

    if (step === 5) return !!booking.paymentMethod;
    return false;
  };

  const totalPrice = booking.services.reduce((total, s) => total + s.price, 0);

  // LOGICA FINAL: ENVIAR RESERVA
  const handleConfirm = async () => {
    setIsLoading(true);

    try {
      // Validaciones iniciales
      if (!booking.client || !booking.date || !booking.time || !booking.staff || booking.services.length === 0) {
        throw new Error("Faltan datos para completar la reserva");
      }

      const dateString = format(booking.date, 'yyyy-MM-dd')

      const payload = {
        businessId,
        bookingDate: dateString,
        bookingTime: booking.time,
        staffId: booking.staff.id,
        services: booking.services,
        client: booking.client,
        paymentMethod: booking.paymentMethod
      }

      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error  || 'Error al procesar la reserva')

      setConfirmedCustomerId(data.customerId)

      if (booking.paymentMethod === 'card') {
        //* CONFIGURAR STRIPE CONNECT
        toast.info('Redirigiendo a Stripe...') // <--- TOAST INFO
      } else {
        toast.success('¡Reserva confirmada correctamente!') // <--- TOAST SUCCESS
        setStep(6)
      }
    } catch (err) {
      //* REEMPLAZAR ALERT POR TOAST
      console.error(err)
      toast.error('Error al procesar la reserva: ' + err) // <--- TOAST ERROR
    } finally {
      setIsLoading(false)
    } 
  }

  return (
    <>
      {/* BOTÓN FLOTANTE DE RESERVA */}
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-primary text-foreground px-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all font-bold text-lg group"
      >
        <CalendarDays size={24} className="group-hover:animate-pulse" />
        <span className="hidden sm:inline">Reservar Cita</span>
      </button>

      {/* MODAL (Solo se renderiza si isOpen es true) */}
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center px-4 sm:px-6 stagger-container">

          {/* BACKDROP OSCURO (Cierra al hacer click) */}
          <div
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 touch-none"
          />

          {/* CONTENEDOR PRINCIPAL */}
          <div className="relative bg-background w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] h-auto animate-in zoom-in-95 duration-300 border border-white/10">

            {/* HEADER (Oculto en paso de éxito) */}
            {step < 6 && (
              <div className="p-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  {step > 1 && (
                    <button onClick={prevStep} className="p-2 -ml-2 rounded-full hover:bg-foreground/5 text-foreground transition-colors">
                      <ChevronLeft size={22} />
                    </button>
                  )}
                  <div className="flex flex-col">
                    <h3 className='text-lg text-foreground font-bold font-title leading-tight'>Reserva tu cita</h3>
                    <div className="flex items-center gap-2">
                      {/* Barra de progreso */}
                      <div className="h-1 w-16 bg-foreground/10 rounded-full overflow-hidden mt-0.5">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-muted font-medium">Paso {step}/{TOTAL_STEPS}</span>
                    </div>
                  </div>
                </div>
                <button onClick={handleClose} className='p-2 rounded-full hover:bg-foreground/5 text-muted hover:text-foreground transition-colors'>
                  <X size={22} />
                </button>
              </div>
            )}

            {/* BODY CON SCROLL (Con referencia scrollRef) */}
            <div
              ref={scrollRef}
              className="overflow-y-auto flex-1 scrollbar-hide relative overscroll-contain"
            >
              {/* Padding condicional: quitamos padding en éxito para pantalla completa */}
              <div className={step === 6 ? "h-full" : "p-6"}>
                {step === 1 && <StepService booking={booking} setBooking={setBooking} servicesList={availableServices} isLoading={isLoading} />}
                {step === 2 && <StepStaff booking={booking} setBooking={setBooking} staffList={staff} isLoading={isLoading} />}
                {step === 3 && <StepDate booking={booking} setBooking={setBooking} />}
                {step === 4 && <StepForm booking={booking} setBooking={setBooking} />}
                {step === 5 && <StepPayment booking={booking} setBooking={setBooking} />}

                {/* PANTALLA FINAL */}
                {step === 6 && <StepSuccess booking={booking} onClose={handleClose} customerId={confirmedCustomerId ? confirmedCustomerId : ''} />}
              </div>
            </div>

            {/* FOOTER (Oculto en paso de éxito) */}
            {step < 6 && (
              <div className="p-4 border-t border-border bg-background/90 backdrop-blur-md sticky bottom-0 z-10 shrink-0">
                <div className="flex items-center justify-between gap-4">

                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-muted font-bold">Total estimado</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-title text-foreground animate-in slide-in-from-bottom-2">
                        {totalPrice}€
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={step === TOTAL_STEPS ? handleConfirm : nextStep}
                    disabled={!canContinue() || isLoading}
                    className={cn(
                      "flex-1 max-w-50 py-3.5 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300",
                      canContinue() && !isLoading
                        ? "bg-foreground text-background shadow-lg hover:scale-[1.02] active:scale-95"
                        : "bg-muted/20 text-muted cursor-not-allowed opacity-50"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      step === TOTAL_STEPS ? (
                        <>Confirmar <CheckCircle size={18} /></>
                      ) : (
                        <>Continuar <ArrowRight size={18} /></>
                      )
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}