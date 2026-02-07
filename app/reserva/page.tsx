'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, Clock, MapPin, History, ArrowRight, User, ChevronLeft, Loader2, X, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from 'sonner';
import { useBooking } from '@/context/BookingContext';
import { SITE_CONFIG } from '@/config';

// Interfaz específica para el historial (lo que viene de la DB)
interface BookingHistoryItem {
  id: string;
  date: string;
  start_time: string;
  status: string;
  customer_name?: string;
  staff?: { full_name: string } | null;
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
  
  // Estado para el modal de detalles
  const [selectedBooking, setSelectedBooking] = useState<BookingHistoryItem | null>(null);

  // Contexto para abrir el modal de nueva reserva
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
                // Usamos la configuración correcta
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
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [executeSearch]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast.error('Introduce un email válido');
      return;
    }
    executeSearch(email);
    toast.success('Buscando citas...');
  };

  const handleCancelBooking = async (bookingId: string) => {
    // 1. Optimistic UI: Actualizamos visualmente antes
    const previousBookings = [...bookings]
    
    const updatedBookings = bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
    );
    setBookings(updatedBookings);
    
    // 2. Cerrar modal de detalles
    setSelectedBooking(null);

    try {
        const response = await fetch('/api/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, email, businessId: SITE_CONFIG.supabaseData.businessId })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Error al cancelar')
        } 
        toast.success('Reserva cancelada correctamente');
    } catch (error) {
        console.error(error)
        // Rollback si falla
        setBookings(previousBookings)
        toast.error('Hubo un problema al cancelar la reserva')
    }
  };

  const upcomingBookings = bookings.filter(b => b.date > '2024-01-01' && b.status !== 'cancelled');
  const pastBookings = bookings.filter(b => b.date <= '2024-01-01' || b.status === 'cancelled');

  return (
    <div className="min-h-screen pb-20 font-sans stagger-container">

      {/* HEADER */}
      <div className="sticky top-0 z-20 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:text-muted text-foreground/80 transition-colors">
            <ChevronLeft size={24} />
        </Link>
        <div>
            <h1 className="font-title text-xl md:text-2xl font-bold text-foreground leading-none">Mis Reservas</h1>
            <p className="text-xs md:text-sm text-muted font-medium mt-0.5">Historial y próximas citas</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 space-y-8 mt-4">
        
        {/* BUSCADOR */}
        <div className="relative group">
            <div className="relative bg-background-secondary p-1.5 rounded-2xl shadow-sm border border-foreground/10 flex items-center">
                <Search className="ml-3 text-muted shrink-0" size={20} />
                <form onSubmit={handleManualSearch} className="flex-1 flex items-center">
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full px-3 py-3 bg-transparent border-none focus:ring-0 outline-none text-sm font-medium text-foreground placeholder:text-muted/70"
                    />
                    <button 
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-background px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-secondary transition-all disabled:opacity-70 shrink-0 flex items-center gap-2"
                    >
                        {loading && <Loader2 size={12} className="animate-spin" />}
                        {loading ? '...' : 'Buscar'}
                    </button>
                </form>
            </div>
        </div>

        {/* LOADING */}
        {loading && !searched && (
            <div className="flex flex-col items-center justify-center py-12 text-muted animate-pulse">
                <Loader2 size={32} className="animate-spin mb-2" />
                <p className="text-sm">Recuperando tus citas...</p>
            </div>
        )}

        {/* RESULTADOS */}
        {searched && !loading && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 stagger-container">
                
                {/* PRÓXIMAS */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Próximas
                        </h2>
                        {upcomingBookings.length > 0 && (
                             <span className="text-[10px] font-bold bg-foreground/5 text-foreground/60 px-2 py-1 rounded-md">
                                {upcomingBookings.length} Activas
                             </span>
                        )}
                    </div>
                    
                    {upcomingBookings.length === 0 ? (
                        <div className="text-center py-12 px-6 border border-dashed border-foreground/20 rounded-3xl bg-background-secondary">
                            <div className="w-12 h-12 bg-foreground/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Calendar className="text-muted" size={24} />
                            </div>
                            <p className="text-foreground font-medium text-sm">Todo despejado</p>
                            <p className="text-muted text-xs mb-4">No tienes citas programadas.</p>
                            {/* Botón para abrir el modal de nueva reserva desde el contexto */}
                            <button 
                                onClick={() => {
                                    console.log('Hola')
                                    openModal()
                                }}
                                className="text-xs font-bold text-primary underline decoration-2 underline-offset-4 cursor-pointer"
                            >
                                Reservar ahora
                            </button>
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
                <section>
                    <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-4 px-1 flex items-center gap-2 border-t border-foreground/20 pt-6">
                        <History size={14} /> Historial Reciente
                    </h2>
                    
                    <div className="space-y-4">
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

            </div>
        )}
      </div>

      {/* MODAL DE DETALLES DE UNA CITA EXISTENTE */}
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

// --- TICKET CARD ---

function TicketCard({ booking, isPast = false, onClick }: { booking: BookingHistoryItem, isPast?: boolean, onClick: () => void }) {
    // 1. FECHA SEGURA
    let dateObj = new Date();
    try {
        if (booking.date) {
            dateObj = new Date(`${booking.date}T00:00:00`); 
        }
    } catch (e) { console.error("Error fecha", e); }

    const day = format(dateObj, 'd');
    const month = format(dateObj, 'MMM', { locale: es }).toUpperCase();
    
    // 2. HORA SEGURA
    const time = booking.start_time ? booking.start_time.slice(0, 5) : '--:--';

    // 3. SERVICIO SEGURO
    const serviceName = booking.booking_items?.[0]?.services?.title || 'Servicio General';
    const duration = booking.booking_items?.[0]?.services?.duration || 30;

    // 4. STAFF SEGURO
    const staffName = booking.staff?.full_name || 'Staff';

    const statusColor = {
        confirmed: 'bg-foreground',
        pending_payment: 'bg-orange-500',
        cancelled: 'bg-red-500',
        completed: 'bg-gray-400'
    }[booking.status] || 'bg-gray-400';

    return (
        <button 
            onClick={onClick}
            className={`
                w-full bg-transparent border border-foreground/20 rounded-2xl overflow-hidden flex text-left
                transition-all duration-300 ease-out cursor-pointer
                ${isPast 
                    ? 'opacity-60 grayscale-[0.8] hover:opacity-100 hover:grayscale-0' 
                    : 'shadow-sm hover:shadow-xl hover:-translate-y-1'
                }
            `}
        >
            <div className={`w-18 shrink-0 flex flex-col items-center justify-center gap-0.5 py-4 border-r border-dashed border-foreground/20 relative bg-background-secondary`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColor}`} />
                <span className="text-[10px] font-black tracking-widest text-muted/60 uppercase">{month}</span>
                <span className="text-2xl font-black text-foreground leading-none">{day}</span>
                <span className="text-xs font-bold text-muted mt-1">{time}</span>
            </div>

            <div className="flex-1 p-4 flex flex-col justify-center min-w-0 bg-background-secondary">
                <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-sm text-foreground leading-tight truncate pr-2 ${booking.status === 'cancelled' ? 'line-through text-muted' : ''}`}>
                        {serviceName}
                    </h3>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${statusColor}`} />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted mb-3 mt-1">
                    <span className="flex items-center gap-1">
                        <User size={12} className="text-foreground/70" /> {staffName}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={12} className="text-foreground/70" /> {duration} min
                    </span>
                </div>
                {!isPast ? (
                     <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 w-full">
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                            <MapPin size={10} /> Calle Falsa 123
                        </div>
                        <span className="text-[10px] font-bold text-foreground flex items-center gap-1">
                            Ver Detalles <ArrowRight size={10}/>
                        </span>
                    </div>
                ) : (
                    <div className="pt-2 mt-auto">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted bg-gray-100 px-2 py-1 rounded-sm">
                            {booking.status === 'cancelled' ? 'Cancelada' : 'Finalizada'}
                        </span>
                    </div>
                )}
            </div>
        </button>
    );
}

// --- MODAL DETALLES ---

function BookingDetailsModal({ booking, onClose, onCancel }: { booking: BookingHistoryItem, onClose: () => void, onCancel: (id: string) => void }) {
    const isCancellable = booking.status !== 'cancelled' && booking.status !== 'completed';
    
    const statusLabels: Record<string, string> = {
        confirmed: 'Confirmada',
        pending_payment: 'Pendiente de Pago',
        cancelled: 'Cancelada',
        completed: 'Completada'
    };
     const statusColor = {
        confirmed: 'bg-green-100 text-green-700 border-green-200',
        pending_payment: 'bg-orange-100 text-orange-700 border-orange-200',
        cancelled: 'bg-red-50 text-red-600 border-red-100',
        completed: 'bg-gray-100 text-gray-600 border-gray-200'
    }[booking.status] || 'bg-gray-100';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-background w-full max-w-sm rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
                <div className="h-32 bg-foreground/5 relative flex items-center justify-center">
                    <MapPin size={40} className="text-foreground/10" />
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-background-secondary backdrop-blur rounded-full hover:bg-background-secondary/80 transition-colors text-muted">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6 -mt-6 bg-background rounded-t-3xl relative">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="font-title text-2xl font-bold text-foreground mb-1">Detalles Cita</h2>
                            <p className="text-sm text-muted">Para: {booking.customer_name}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${statusColor}`}>
                            {statusLabels[booking.status] || booking.status}
                        </span>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-4 p-3 bg-background-secondary rounded-xl border border-foreground/20">
                            <div className="p-2 bg-foreground/40 rounded-lg shadow-sm text-foreground">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-muted font-bold uppercase">Fecha y Hora</p>
                                <p className="font-semibold text-foreground capitalize">
                                    {format(new Date(booking.date), 'EEEE d MMMM', { locale: es })}
                                </p>
                                <p className="text-sm text-foreground/80">
                                    a las {booking.start_time.slice(0, 5)}h
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-3 bg-background-secondary rounded-xl border border-foreground/20">
                             <div className="p-2 bg-foreground/20 rounded-lg shadow-sm text-foreground">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-muted font-bold uppercase">Servicio y Staff</p>
                                <p className="font-semibold text-foreground">
                                    {booking.booking_items?.[0]?.services?.title}
                                </p>
                                <p className="text-sm text-foreground/80">
                                    con {booking.staff?.full_name || 'Staff asignado'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mt-8">
                        {isCancellable && (
                            <button 
                                onClick={() => onCancel(booking.id)}
                                className="w-full py-3.5 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <AlertTriangle size={16} /> Cancelar Reserva
                            </button>
                        )}
                         {!isCancellable && booking.status !== 'cancelled' && (
                            <p className="text-center text-xs text-muted italic">
                                Esta reserva ya no se puede cancelar.
                            </p>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
}