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

export default function BookingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[] | []>([])
  const [staff, setStaff] = useState<Profile[] | []>([])
  const [schedules, setSchedules] = useState<StaffSchedule[] | []>([])
  const [busySlots, setBusySlots] = useState<BusySlot[] | []>([])
  const [loadingAviability, setLoadingAviability] = useState<boolean>(false)
  const [ confirmedCustomerId, setConfirmedCustomerId ] = useState<string | null>(null)

  // Referencia para el contenedor del scroll
  const scrollRef = useRef<HTMLDivElement>(null);

  const TOTAL_STEPS = 5;

  // ESTADO GLOBAL DE LA RESERVA
  const [booking, setBooking] = useState<Booking>({
    services: [],
    staff: null,
    date: undefined,
    time: null,
    client: null,
    paymentMethod: null,
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

  const BUSINESS_ID = 'b0880124-97ad-4560-8542-fbc31ff46a8f'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [servicesRes, staffRes, schedulesRes] = await Promise.all([
          supabase.from('services').select('*').eq('business_id', BUSINESS_ID),
          supabase.from('profiles').select('*').eq('business_id', BUSINESS_ID),
          supabase.from('staff_schedules').select('*').eq('business_id', BUSINESS_ID)
        ])
        if (servicesRes.error) throw servicesRes.error
        if (staffRes.error) throw staffRes.error
        if (schedulesRes.error) throw schedulesRes.error

        const anyStaff: Profile = {
          id: 'any',
          full_name: 'Cualquiera',
          role: 'Primer hueco libre'
        }

        setAvailableServices(servicesRes.data || [])
        setStaff([anyStaff, ...(staffRes.data || [])])
        setSchedules(schedulesRes.data || [])
      }
      catch (error) {
        console.error('Error cargando datos: ' + error)
        toast.error('Error al cargar los datos del negocio') // <--- AÑADIDO TOAST ERROR
      }
      finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fechBusySlots = async () => {
      if (!booking.date || !booking.staff) return

      const selectedDateString = format(booking.date, 'yyyy-MM--dd')
      const staffId = booking.staff.id

      try {
        setLoadingAviability(true)

        let query = supabase
          .from('bookings')
          .select('start_time, end_time, staff_id')
          .eq('business_id', BUSINESS_ID)
          .eq('date', selectedDateString)
          .eq('status', 'confirmed')

        if (staffId !== 'any') {
          query = query.eq('staff_id', staffId)
        }

        const { data, error } = await query

        if (error) throw error.message
        setBusySlots(data || [])
      }
      catch (error) {
        console.error('Error buscando huecos: ' + error)
        toast.error('No se pudieron cargar los horarios disponibles') // <--- AÑADIDO TOAST ERROR
      }
      finally {
        setLoadingAviability(false)
      }
    }
    fechBusySlots()
  }, [booking.date, booking.staff])

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
    setIsOpen(false);
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

      let asignedStaffId = booking.staff.id

      // -------------------------------------------------------------
      // 📍 LÓGICA DE ASIGNACIÓN AUTOMÁTICA
      // -------------------------------------------------------------
      if (asignedStaffId === 'any') {
        const dayOfWeek = getDay(booking.date)
        const [hours, minutes] = booking.time.split(':').map(Number)

        const bookingStartMins = hours * 60 + minutes
        const totalDuration = booking.services.reduce((acc, s) => acc + s.duration, 0)
        const bookingEndMins = bookingStartMins + totalDuration

        // Buscamos candidatos reales (excluyendo 'any')
        const candidates = staff.filter(s => s.id !== 'any')

        const freeStaf = candidates.find(c => {
          // 1. Buscar horario (CORREGIDO: Return implícito)
          const schedule = schedules.find(s => 
            s.staff_id === c.id &&
            s.day_of_week === dayOfWeek &&
            s.is_working
          )

          if (!schedule) return false

          const [startH, startM] = schedule.start_time.split(':').map(Number)
          const [endH, endM] = schedule.end_time.split(':').map(Number)
          const shiftStart = startH * 60 + startM
          const shiftEnd = endH * 60 + endM

          //* El nuevo empieza antes del horario de apertura
          //* El nuevo acaba mas tarde del horario de cierre
          if (bookingStartMins < shiftStart || shiftEnd < bookingEndMins) return false

          // 3. Verificar Descanso (CORREGIDO: schedule.break_end)
          if (schedule.break_start && schedule.break_end) {
            const [bStartH, bStartM] = schedule.break_start.split(':').map(Number)
            const [bEndH, bEndM] = schedule.break_end.split(':').map(Number) // <--- CORREGIDO AQUÍ
            
            const breakStart = bStartH * 60 + bStartM
            const breakEnd = bEndH * 60 + bEndM

            //* El nuevo empieza antes de que el otro acabe
            //* El nuevo acaba mas tarde de que el otro empiece
            if (bookingStartMins < breakEnd && bookingEndMins > breakStart) return false
          }

          // 4. Verificar Conflictos con otras citas
          const hasConflict = busySlots.some(busy => {
            // Importante: Solo miramos las citas de ESTE candidato
            if (busy.staff_id !== c.id) return false;

            const busyDate = new Date(busy.start_time)
            const busyEnd = new Date(busy.end_time)

            const busyStartMins = busyDate.getHours() * 60 + busyDate.getMinutes()
            const busyEndMins = busyEnd.getHours() * 60 + busyEnd.getMinutes()

            return (bookingStartMins < busyEndMins && bookingEndMins > busyStartMins)
          })

          return !hasConflict
        })

        if (!freeStaf) {
          throw new Error('Lo sentimos, el hueco ha dejado de estar disponible justo ahora.')
        }

        asignedStaffId = freeStaf.id
      }
      
      // ... (El resto de la lógica de Clientes, Bookings e Items es correcta) ...
      // ... Mantenemos tu código igual a partir de aquí ...

      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', booking.client.email)
        .single()

      let customerId = existingCustomer?.id

      if (customerId) {
        await supabase
          .from('customers')
          .update({
            full_name: booking.client.name,
            phone: booking.client.phone
          })
          .eq('id', customerId)
      } else {
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert({
            full_name: booking.client.name,
            email: booking.client.email,
            phone: booking.client.phone
          })
          .select()
          .single()

          if (createError) throw createError
          customerId = newCustomer.id
      }

      setConfirmedCustomerId(customerId)

      const [ hours, minutes ] = booking.time.split(':').map(Number)
      const startTime = new Date(booking.date)
      startTime.setHours(hours, minutes, 0)

      const totalDuration = booking.services.reduce((acc, s) => acc + s.duration, 0)
      const endTime = new Date(startTime.getTime() + totalDuration * 60000)

      const { data: newBooking, error: errorBooking } = await supabase
        .from('bookings')
        .insert({
          business_id: BUSINESS_ID,
          customer_id: customerId,
          staff_id: asignedStaffId,
          date: format(booking.date, 'yyyy-MM-dd'),
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: booking.paymentMethod === 'card' ? 'pending_payment' : 'confirmed',
          total_price: totalPrice,
          payment_method: booking.paymentMethod,
          customer_name: booking.client.name,
          customer_email: booking.client.email,
          customer_phone: booking.client.phone
        })
        .select()
        .single()

      if (errorBooking) throw errorBooking

      const itemsToInsert = booking.services.map(s => ({
        booking_id: newBooking.id,
        service_id: s.id,
        price: s.price
      }))

      const { error: itemsError } = await supabase
        .from('booking_items')
        .insert(itemsToInsert)

      if (itemsError) throw itemsError

      if (booking.paymentMethod !== 'card') {
        const serviceNames = booking.services.map(s => s.title)

        await fetch('/api/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: booking.client.name,
            email: booking.client.email,
            date: format(booking.date, 'dd/MM/yyyy'),
            time: booking.time,
            services: serviceNames, // Pasamos la lista simple
            price: totalPrice,
            staffName: booking.staff.full_name, // Ojo, asegurate de tener el nombre
            bookingId: newBooking.id
          })
        })

        fetch('/api/notifications/send', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            email: booking.client.email,
            title: '✅ ¡Reserva Confirmada!',
            message: `Hola ${booking.client.name}, tu cita es el ${format(booking.date, 'dd/MM')} a las ${booking.time}.`,
            url: window.location.origin //* AQUI PODRIAMOS PLANTEAR LA IDEA DE SITIO FANTASMA 
          })
        }).catch(err => console.error('Error enviando push: ', err))
      }

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
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-foreground text-background px-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all font-bold text-lg group"
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
                {step === 3 && <StepDate booking={booking} setBooking={setBooking} timeSlots={busySlots} schedules={schedules} isLoading={loadingAviability} staffList={staff} />}
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