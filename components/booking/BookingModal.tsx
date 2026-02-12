'use client';

import { useState, useEffect, useRef } from 'react';
import { X, CalendarDays, ChevronLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns'
import { toast } from 'sonner';

// IMPORTS DE LOS PASOS
import StepService from './StepService';
import StepStaff from './StepStaff';
import StepDate from './StepDate';
import StepForm from './StepForm';
import StepPayment from './StepPayment';
import StepSuccess from './StepSuccess';
import { ServiceDB } from '@/lib/types/databaseTypes';
import { useBooking } from '@/context/BookingContext';
import { SITE_CONFIG } from '@/config';
import { clientFormSchema } from '@/lib/schemas';

// --- INTERFACES (Sin cambios) ---
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
  short_desc?: string;
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
  // --- ESTADOS DE LA RESERVA ---
  const [ step, setStep ] = useState(1)
  const [ isLoading, setIsLoading ] = useState<boolean>(false)
  const [ availableServices ] = useState<ServiceDB[] | []>(services)
  const [ staff, setStaff ] = useState<Profile[] | []>([])
  const [ confirmedCustomerId, setConfirmedCustomerId ] = useState<string | null>(null)

  const { isOpen, openModal, closeModal } = useBooking()
  const businessId = SITE_CONFIG.supabaseData.businessId
  const scrollRef = useRef<HTMLDivElement>(null)
  const TOTAL_STEPS = 5

  const [booking, setBooking] = useState<Booking>({
    services: [],
    staff: null,
    date: undefined,
    time: null,
    client: null,
    paymentMethod: 'venue',
  });

  // --- LÓGICA DE ANIMACIÓN DE SALIDA (NUEVA) ---
  // isClosing: Indica que el usuario ha pedido cerrar, pero estamos animando la salida.
  // isVisible: Controla si el modal está renderizado en el DOM.
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    } else {
      // Si isOpen pasa a false, iniciamos la animación de cierre
      setIsClosing(true);
      // Esperamos 300ms (duración de la animación CSS) antes de desmontar
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // --- MANEJO DE CIERRE (Updated) ---
  const handleClose = () => {
    closeModal(); // Dispara el useEffect de arriba (isOpen -> false)
    
    // Reseteo de estados después de la animación
    setTimeout(() => {
        setStep(1);
        setBooking(prev => ({
            services: prev.services,
            staff: prev.staff,
            date: prev.date,
            time: null,
            client: prev.client,
            paymentMethod: 'venue',
        }));
        setConfirmedCustomerId(null);
    }, 300); // Sincronizado con la duración de la animación
  };

  // --- LOGICA DE NEGOCIO (Sin cambios estructurales) ---


  // Carga localStorage
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
        } catch (err) { console.error(err) }
      }
    }
  }, [])

  // Guardar localStorage
  useEffect(() => {
    if (booking.client) {
      const { name, email, phone } = booking.client
      if (name || email || phone) {
        localStorage.setItem('booking_client_info', JSON.stringify({ name, email, phone }))
      }
    }
  }, [booking.client])

  // Cargar Staff
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
          const anyStaff: Profile = { id: 'any', full_name: 'Cualquiera', role: 'Primer hueco libre' }
          setStaff([ anyStaff, ...staffData ])
        }
      } catch (err) {
          console.error(err);
          toast.error('Error cargando profesionales');
      } finally {
        setIsLoading(false)
      }
    }
    fetchStaff()
  }, [isOpen, businessId])

  // Bloqueo Scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Reset Scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step]);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // Validación
  const canContinue = () => {
    if (step === 1) return booking.services.length > 0;
    if (step === 2) return !!booking.staff;
    if (step === 3) return !!booking.date && !!booking.time;
    if (step === 4) {
      if (!booking.client) return false;
      const result = clientFormSchema.safeParse(booking.client);
      return result.success;
    }
    if (step === 5) return !!booking.paymentMethod;
    return false;
  };

  const totalPrice = booking.services.reduce((total, s) => total + s.price, 0);

  // Confirmar
  const handleConfirm = async () => {
    setIsLoading(true);
    try {
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

      if (data.success) {
        localStorage.setItem('customerId', data.customerId)
      }
      if (booking.paymentMethod === 'card') {
        toast.info('Redirigiendo a Stripe...')
      } else {
        toast.success('¡Reserva confirmada correctamente!')
        setStep(6)
      }
    } catch (err) {
      console.error(err)
      toast.error('Error al procesar la reserva: ' + err)
    } finally {
      setIsLoading(false)
    } 
  }

  // --- RENDERIZADO ---

  // Si no está abierto ni visible (animando salida), mostramos solo el botón flotante
  if (!isOpen && !isVisible) return (
      <button
        onClick={() => openModal()}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-primary text-foreground px-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all font-bold text-lg group cursor-pointer animate-in fade-in zoom-in duration-300"
      >
        <CalendarDays size={24} className="group-hover:animate-pulse" />
        <span className="hidden sm:inline">Reservar Cita</span>
      </button>
  );

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center px-4 sm:px-6 stagger-container">

      {/* BACKDROP OSCURO */}
      <div
        onClick={handleClose}
        className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-md touch-none transition-opacity duration-300 ease-out",
            // Solo aplicamos opacidad 0 al cerrar. Al abrir, dejamos que entre normal (sin animate-in explícito si ya lo hace el padre, o lo añadimos si queremos fade-in suave)
            isClosing ? "opacity-0" : "animate-in fade-in"
        )}
      />

      {/* CONTENEDOR PRINCIPAL */}
      <div 
        className={cn(
            "relative bg-background w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] h-auto border border-white/10 transition-all duration-300 ease-out",
            // ANIMACIÓN DE SALIDA: Escala baja un poco y se va hacia abajo con fade out
            isClosing 
                && "opacity-0 scale-10 translate-y-140 duration-500" 
                
        )}
      >

        {/* HEADER */}
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

        {/* BODY CON SCROLL */}
        <div
          ref={scrollRef}
          className="overflow-y-auto flex-1 scrollbar-hide relative overscroll-contain"
        >
          <div className={step === 6 ? "h-full" : "p-6"}>
            {step === 1 && <StepService booking={booking} setBooking={setBooking} servicesList={availableServices} isLoading={isLoading} />}
            {step === 2 && <StepStaff booking={booking} setBooking={setBooking} staffList={staff} isLoading={isLoading} />}
            {step === 3 && <StepDate booking={booking} setBooking={setBooking} />}
            {step === 4 && <StepForm booking={booking} setBooking={setBooking} />}
            {step === 5 && <StepPayment booking={booking} setBooking={setBooking} />}
            {step === 6 && <StepSuccess booking={booking} onClose={handleClose} customerId={confirmedCustomerId ? confirmedCustomerId : ''} />}
          </div>
        </div>

        {/* FOOTER */}
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
  );
}