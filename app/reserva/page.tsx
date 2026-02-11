'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, Clock, MapPin, History, ArrowRight, User, ChevronLeft, Loader2, X, AlertTriangle, CheckCircle2, Scissors, LocateIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from 'sonner';
import { useBooking } from '@/context/BookingContext';
import { SITE_CONFIG } from '@/config';
import { emailSearchSchema } from '@/lib/schemas';

// Interfaz
interface BookingHistoryItem {
  id: string;
  date: string;
  start_time: string;
  status: string;
  customer_name?: string;
  staff?: { full_name: string } | null;
  // Array de items (Servicios)
  booking_items: Array<{
    price: number;
    services: { title: string; duration: number } | null
  }>;
}

export default function MyBookingsPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingHistoryItem | null>(null);
  const { openModal } = useBooking();

  const executeSearch = useCallback(async (emailToSearch: string) => {
    if (!emailToSearch) return;
    setLoading(true);

    try {
        const response = await fetch('/api/my-bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: emailToSearch,
                businessId: SITE_CONFIG.supabaseData.businessId 
            })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Error al obtener citas')

        setBookings(data.bookings || [])
        setSearched(true)
        localStorage.setItem('booking_client_info', JSON.stringify({ email: emailToSearch }))
    } catch (error) {
        console.error(error)
        toast.error('No se pudieron cargar las citas')
    } finally {
        setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('booking_client_info');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.email) {
            setEmail(parsed.email);
            executeSearch(parsed.email);
          }
        } catch (e) { console.error(e); }
      }
    }
  }, [executeSearch]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validamos el email usando el esquema de Zod
    const result = emailSearchSchema.safeParse({ email });

    if (!result.success) {
      // Mostramos el mensaje de error que definimos en schemas.ts
      toast.error(result.error.issues[0].message);
      return;
    }
    
    // Si pasa la validación, buscamos
    executeSearch(email);
    toast.success('Buscando citas...');
  };

  const handleCancelBooking = async (bookingId: string) => {
    const previousBookings = [...bookings]
    const updatedBookings = bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
    );
    setBookings(updatedBookings);
    setSelectedBooking(null);

    try {
        const response = await fetch('/api/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, email, businessId: SITE_CONFIG.supabaseData.businessId })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Error al cancelar')
        toast.success('Reserva cancelada correctamente');
    } catch (error) {
        console.error(error)
        setBookings(previousBookings)
        toast.error('Hubo un problema al cancelar la reserva')
    }
  };

  // Ordenar: Próximas primero
  const upcomingBookings = bookings.filter(b => b.date >= new Date().toISOString().split('T')[0] && b.status !== 'cancelled');
  const pastBookings = bookings.filter(b => b.date < new Date().toISOString().split('T')[0] || b.status === 'cancelled');

  return (
    <div className="min-h-screen pb-20 font-regular stagger-container">

      {/* HEADER */}
      <div className="sticky top-0 z-20 px-6 py-4 flex justify-between items-center gap-4 stagger-container">
        <div className='flex items-center'>
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-secondary/50 text-foreground transition-colors">
                <ChevronLeft size={24} />
            </Link>
            <div className='px-4'>
                <h1 className="font-title text-xl md:text-2xl font-bold text-foreground leading-none">Mis Reservas</h1>
                <p className="text-xs md:text-sm text-muted font-medium mt-0.5">Gestión de citas</p>
            </div>
        </div>
        {
            email &&
            <div className='hidden bg-green-600/10 border border-green-800 px-4 py-1 rounded-full md:flex items-center gap-2'>
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className='text-muted font-regular font-semibold text-sm'>{email}</span>
            </div>
        }
      </div>

      <div className="max-w-md mx-auto px-5 space-y-8 mt-6 stagger-container">
        
        {/* BUSCADOR */}
        <div className="relative group">
            <div className="relative bg-background-secondary p-1.5 rounded-2xl shadow-sm border border-foreground/10 flex items-center focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Search className="ml-3 text-muted shrink-0" size={20} />
                <form onSubmit={handleManualSearch} className="flex-1 flex items-center">
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Introduce tu email..."
                        className="w-full px-3 py-3 bg-transparent border-none focus:ring-0 outline-none text-sm font-medium text-foreground placeholder:text-muted/70"
                    />
                    <button 
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-xs font-bold hover:brightness-110 transition-all disabled:opacity-70 shrink-0 flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                        {loading && <Loader2 size={12} className="animate-spin" />}
                        {loading ? '...' : 'Ver Citas'}
                    </button>
                </form>
            </div>
        </div>

        {/* LOADING STATE */}
        {loading && !searched && (
            <div className="flex flex-col items-center justify-center py-12 text-muted animate-pulse">
                <Loader2 size={32} className="animate-spin mb-3 text-primary" />
                <p className="text-sm font-medium">Buscando en la agenda...</p>
            </div>
        )}

        {/* ESTADO VACÍO O NO ENCONTRADO */}
        {searched && !loading && bookings.length === 0 && (
             <div className="text-center py-12 px-6 border border-dashed border-foreground/20 rounded-3xl bg-background-secondary/50">
                <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-foreground/5">
                    <Calendar className="text-muted" size={28} />
                </div>
                <h3 className="text-foreground font-bold text-lg mb-1">Sin resultados</h3>
                <p className="text-muted text-sm mb-6">No encontramos citas asociadas a este email.</p>
                <button 
                    onClick={() => openModal()}
                    className="text-sm font-bold text-primary hover:underline decoration-2 underline-offset-4 cursor-pointer"
                >
                    Hacer una nueva reserva
                </button>
            </div>
        )}

        {/* LISTADO DE RESULTADOS */}
        {searched && !loading && bookings.length > 0 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* PRÓXIMAS */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Activas
                        </h2>
                    </div>
                    
                    {upcomingBookings.length === 0 ? (
                        <div className="text-center h-60 flex justify-center items-center flex-col bg-background-secondary rounded-2xl border border-dashed border-foreground/20">
                            <p className="text-muted text-sm">No tienes citas próximas.</p>
                            <button onClick={() => openModal()} className="mt-2 text-xs font-bold text-primary underline cursor-pointer">Reservar ahora</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingBookings.map(booking => (
                                <TicketCard 
                                    key={booking.id} 
                                    booking={booking} 
                                    onClick={() => setSelectedBooking(booking)}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* HISTORIAL */}
                {pastBookings.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 px-1 flex items-center gap-2 border-t border-foreground/10 pt-8">
                            <History size={14} /> Historial
                        </h2>
                        <div className="space-y-4 opacity-80 hover:opacity-100 transition-opacity">
                            {pastBookings.map(booking => (
                                <TicketCard 
                                    key={booking.id} 
                                    booking={booking} 
                                    isPast
                                    onClick={() => setSelectedBooking(booking)}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        )}
      </div>

      {/* MODAL DETALLES */}
      {selectedBooking && (
          <BookingDetailsModal 
             booking={selectedBooking} 
             onClose={() => setSelectedBooking(null)}
             onCancel={handleCancelBooking}
          />
      )}

    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function TicketCard({ booking, isPast = false, onClick }: { booking: BookingHistoryItem, isPast?: boolean, onClick: () => void }) {
    // 1. FECHA Y HORA
    let dateObj = new Date();
    try {
        if (booking.date) dateObj = new Date(`${booking.date}T00:00:00`); 
    } catch (e) { console.error(e); }

    const day = format(dateObj, 'd');
    const month = format(dateObj, 'MMM', { locale: es }).toUpperCase();
    const time = booking.start_time && format(booking.start_time, 'HH:mm', { locale: es })

    // 2. LÓGICA MULTI-SERVICIO (SOLUCIÓN AL ERROR)
    // Sumamos duraciones y determinamos el título
    const totalDuration = booking.booking_items.reduce((acc, item) => acc + (item.services?.duration || 0), 0);
    const mainServiceTitle = booking.booking_items[0]?.services?.title || 'Servicio';
    const extraServicesCount = booking.booking_items.length - 1;
    
    // Título inteligente: "Corte Fade + 2 servicios"
    const displayTitle = extraServicesCount > 0 
        ? `${mainServiceTitle} (+${extraServicesCount})`
        : mainServiceTitle;

    const staffName = booking.staff?.full_name || 'Staff';

    const statusStyles = {
        confirmed: 'bg-foreground text-background',
        pending_payment: 'bg-orange-500 text-white',
        cancelled: 'bg-red-500 text-white',
        completed: 'bg-green-500 text-foreground'
    }[booking.status] || 'bg-muted text-foreground';

    return (
        <button 
            onClick={onClick}
            className={`
                w-full group font-regular relative bg-background-secondary border border-foreground/10 rounded-2xl overflow-hidden flex text-left
                transition-all duration-300 ease-out cursor-pointer hover:border-primary/30
                ${isPast ? 'grayscale-[0.5] hover:grayscale-0' : 'shadow-sm hover:shadow-lg hover:-translate-y-0.5'}
            `}
        >
            {/* Lado Izquierdo (Fecha) */}
            <div className="w-20 shrink-0 flex flex-col items-center justify-center gap-0.5 py-4 border-r border-dashed border-foreground/10 bg-foreground/5 relative font-title">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusStyles.split(' ')[0]}`} />
                <span className="text-[10px] font-black tracking-widest text-muted uppercase">{month}</span>
                <span className="text-3xl font-black text-foreground leading-none">{day}</span>
                <span className="text-xs font-bold text-muted mt-1">{time}</span>
            </div>

            {/* Lado Derecho (Info) */}
            <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
                <div className="flex justify-between items-start mb-1.5">
                    <h3 className={`font-bold text-sm md:text-base text-foreground leading-tight truncate pr-2 ${booking.status === 'cancelled' ? 'line-through text-muted' : ''}`}>
                        {displayTitle}
                    </h3>
                    {extraServicesCount > 0 && (
                        <span className="shrink-0 text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
                            Pack
                        </span>
                    )}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted mb-3">
                    <span className="flex items-center gap-1">
                        <User size={12} /> {staffName}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={12} /> {totalDuration} min
                    </span>
                </div>

                {!isPast ? (
                     <div className="flex items-center justify-between mt-auto pt-3 border-t border-foreground/5 w-full">
                        <div className="flex items-center gap-1 text-[10px] text-muted font-medium">
                            <MapPin size={10} /> {SITE_CONFIG.schemaInfo.address.street}
                        </div>
                        <span className="text-[10px] font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Ver Detalles <ArrowRight size={10}/>
                        </span>
                    </div>
                ) : (
                    <div className="pt-2 mt-auto flex justify-end">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 ${booking.status === 'cancelled' ? 'bg-red-600/10 text-red-600 border rounded-full border-red-600' : 'bg-green-600/20 text-green-500 border rounded-full border-green-500'}`}>
                            {booking.status === 'cancelled' ? 'Cancelada' : 'Finalizada'}
                        </span>
                    </div>
                )}
            </div>
        </button>
    );
}

function BookingDetailsModal({ booking, onClose, onCancel }: { booking: BookingHistoryItem, onClose: () => void, onCancel: (id: string) => void }) {
    const isCancellable = booking.status !== 'cancelled' && booking.status !== 'completed';
    
    const statusConfig = {
        confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-700 border-green-200' },
        pending_payment: { label: 'Pendiente', color: 'bg-orange-100 text-orange-700 border-orange-200' },
        cancelled: { label: 'Cancelada', color: 'bg-red-50 text-red-600 border-red-100' },
        completed: { label: 'Completada', color: 'bg-gray-100 text-gray-600 border-gray-200' }
    }[booking.status] || { label: booking.status, color: 'bg-gray-100' };

    // Calcular totales para el modal
    const totalDuration = booking.booking_items.reduce((acc, item) => acc + (item.services?.duration || 0), 0);
    const totalPrice = booking.booking_items.reduce((acc, item) => acc + item.price, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 stagger-container">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-background w-full max-w-sm rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-foreground/10 flex flex-col max-h-[85vh]">
                
                {/* Header Modal */}
                <div className="h-28 bg-primary/15 relative flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 bg-primary/5"></div>
                    <div className='flex justify-center items-center flex-col gap-2'>
                        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-lg z-10 text-primary">
                            <MapPin size={32} />
                        </div>
                        <span className='text-xs font-semibold text-primary bg-primary/20 px-2 py-0.5 rounded-full border border-primary'>{SITE_CONFIG.schemaInfo.address.street}</span>
                    </div>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-background/50 backdrop-blur rounded-full hover:bg-background transition-colors text-muted hover:text-foreground z-20">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="text-center mb-6">
                        <h2 className="font-title text-2xl font-bold text-foreground">{statusConfig.label}</h2>
                        <p className="text-sm text-muted">ID: {booking.id.slice(0, 8).toUpperCase()}</p>
                    </div>

                    <div className="space-y-4 mb-6">
                        {/* Fecha y Hora */}
                        <div className="flex items-start gap-4 p-3 bg-background-secondary rounded-xl border border-foreground/5">
                            <div className="mt-1">
                                <Calendar size={18} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted font-bold uppercase tracking-wider">Fecha</p>
                                <p className="font-semibold text-foreground capitalize">
                                    {format(new Date(booking.date), 'EEEE d MMMM, yyyy', { locale: es })}
                                </p>
                                <p className="text-sm text-foreground/80">
                                    Hora: {format(booking.start_time, 'HH:mm', { locale: es })} ({totalDuration} min)
                                </p>
                            </div>
                        </div>

                        {/* Staff */}
                        <div className="flex items-start gap-4 p-3 bg-background-secondary rounded-xl border border-foreground/5">
                             <div className="mt-1">
                                <User size={18} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted font-bold uppercase tracking-wider">Profesional</p>
                                <p className="font-semibold text-foreground">
                                    {booking.staff?.full_name || 'Staff asignado'}
                                </p>
                            </div>
                        </div>

                        {/* LISTA DE SERVICIOS (DESGLOSADA) */}
                        <div className="p-4 bg-background-secondary rounded-xl border border-foreground/5">
                            <div className="flex items-center gap-2 mb-3">
                                <Scissors size={16} className="text-primary" />
                                <p className="text-xs text-muted font-bold uppercase tracking-wider">Servicios Contratados</p>
                            </div>
                            <div className="space-y-3">
                                {booking.booking_items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm border-b border-foreground/5 last:border-0 pb-2 last:pb-0">
                                        <div>
                                            <p className="font-medium text-foreground">{item.services?.title || 'Servicio'}</p>
                                            <p className="text-xs text-muted">{item.services?.duration} min</p>
                                        </div>
                                        <p className="font-bold text-foreground">{item.price}€</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-foreground/10">
                                <p className="font-bold text-foreground text-sm">Total</p>
                                <p className="font-black text-lg text-primary font-title">{totalPrice}€</p>
                            </div>
                        </div>
                    </div>

                    {/* Botón Cancelar */}
                    <div className="mt-auto">
                        {isCancellable && 
                            <button 
                                onClick={() => onCancel(booking.id)}
                                className="w-full py-3.5 rounded-xl font-bold text-red-600 bg-red-500/5 hover:bg-red-500/10 border border-red-500 transition-colors flex items-center justify-center gap-2"
                            >
                                <AlertTriangle size={16} /> Cancelar Reserva
                            </button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}