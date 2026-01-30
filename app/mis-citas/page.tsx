'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, Clock, MapPin, History, ArrowRight, User, Scissors } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from 'sonner';

// --- DATOS FALSOS PARA PROBAR LA UI (MOCK DATA) ---
const MOCK_BOOKINGS = [
  {
    id: '1',
    date: '2025-12-25', // Fecha futura
    start_time: '10:00:00',
    status: 'confirmed',
    staff: { full_name: 'Carlos Barbero' },
    booking_items: [{ services: { title: 'Corte Clásico', duration: 30 } }]
  },
  {
    id: '2',
    date: '2025-12-28', // Fecha futura
    start_time: '16:30:00',
    status: 'pending_payment',
    staff: { full_name: 'Ana Estilista' },
    booking_items: [{ services: { title: 'Barba y Ritual', duration: 45 } }]
  },
  {
    id: '3',
    date: '2023-01-15', // Fecha pasada
    start_time: '11:00:00',
    status: 'completed',
    staff: { full_name: 'Carlos Barbero' },
    booking_items: [{ services: { title: 'Corte Niño', duration: 20 } }]
  },
  {
    id: '4',
    date: '2023-02-10', // Fecha pasada
    start_time: '18:00:00',
    status: 'cancelled',
    staff: { full_name: 'Dani Master' },
    booking_items: [{ services: { title: 'Tinte Completo', duration: 90 } }]
  }
];

export default function MyBookingsPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  // 1. Cargar email del localStorage (Solo visual, sin llamar a API)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('booking_client_info');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.email) setEmail(parsed.email);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // 2. Simulamos la búsqueda (Sin Backend todavía)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast.error('Introduce un email válido');
      return;
    }

    setLoading(true);
    
    // Simulamos un retraso de red de 1 segundo
    setTimeout(() => {
      setBookings(MOCK_BOOKINGS); // Cargamos los datos falsos
      setSearched(true);
      setLoading(false);
      localStorage.setItem('booking_client_info', JSON.stringify({ email }));
      toast.success('Citas encontradas (Modo Demo)');
    }, 800);
  };

  // 3. Lógica de separación (Próximas vs Pasadas)
  // Usamos una fecha de referencia fija para que los mocks siempre funcionen igual
  const NOW_REF = new Date('2024-01-01'); 
  // OJO: En producción usarías new Date() real, aquí uso una fecha media
  // para que veas unas futuras y otras pasadas según el MOCK_DATA.
  
  const upcomingBookings = bookings.filter(b => b.date > '2024-01-01' && b.status !== 'cancelled');
  const pastBookings = bookings.filter(b => b.date <= '2024-01-01' || b.status === 'cancelled');

  return (
    <div className="min-h-screen pb-20 font-sans">
      
      {/* HEADER */}
      <div className="bg-background border-b border-foreground/20 sticky top-0 z-10 px-4 py-4 flex items-center justify-between shadow-sm">
        <h1 className="font-title text-2xl font-bold text-foreground">Mis Citas</h1>
        <Link href="/" className="text-md font-medium text-muted hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-gray-100">
            ← Volver
        </Link>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 mt-4">
        
        {/* BUSCADOR */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <label className="text-sm font-bold text-foreground ml-1">Consulta tus reservas</label>
            <form onSubmit={handleSearch} className="relative">
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full pl-10 pr-24 py-3.5 rounded-xl border border-border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/5 focus:border-foreground outline-none transition-all text-sm"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <button 
                    type="submit"
                    disabled={loading}
                    className="absolute right-1.5 top-1.5 bottom-1.5 bg-foreground text-background px-4 rounded-lg text-xs font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                    {loading ? '...' : 'Buscar'}
                </button>
            </form>
            <p className="text-[11px] text-muted ml-1 leading-tight">
                Introduce el email con el que hiciste la reserva para ver tu historial.
            </p>
        </div>

        {/* RESULTADOS */}
        {searched && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* SECCIÓN 1: PRÓXIMAS */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="p-1.5 bg-brand/10 rounded-md text-brand">
                             <Calendar size={16} />
                        </div>
                        <h2 className="text-base font-bold text-foreground">Próximas Citas</h2>
                        <span className="ml-auto text-xs bg-gray-100 px-2 py-0.5 rounded-full font-medium text-gray-600">
                            {upcomingBookings.length}
                        </span>
                    </div>
                    
                    {upcomingBookings.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                            <p className="text-muted text-sm mb-3">No tienes nada pendiente.</p>
                            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold bg-foreground text-background px-4 py-2 rounded-full hover:scale-105 transition-transform">
                                Reservar Nueva Cita
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingBookings.map(booking => (
                                <BookingCard key={booking.id} booking={booking} />
                            ))}
                        </div>
                    )}
                </section>

                {/* SECCIÓN 2: HISTORIAL */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1 mt-8">
                         <div className="p-1.5 bg-gray-100 rounded-md text-gray-500">
                             <History size={16} />
                        </div>
                        <h2 className="text-base font-bold text-gray-500">Historial</h2>
                    </div>
                    
                    <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
                        {pastBookings.map(booking => (
                            <BookingCard key={booking.id} booking={booking} isPast />
                        ))}
                    </div>
                </section>

            </div>
        )}
      </div>
    </div>
  );
}

// --- COMPONENTES VISUALES ---

function BookingCard({ booking, isPast = false }: { booking: any, isPast?: boolean }) {
    // Formateo seguro de fecha
    const dateObj = new Date(booking.date);
    const dayName = format(dateObj, 'EEEE', { locale: es });
    const dayNumber = format(dateObj, 'd');
    const monthName = format(dateObj, 'MMMM', { locale: es });
    
    // Limpieza de hora
    const timeString = booking.start_time.slice(0, 5);

    return (
        <div className={`group bg-white border rounded-2xl p-4 shadow-sm transition-all relative overflow-hidden
            ${isPast ? 'border-gray-200' : 'border-gray-200 hover:border-foreground/30 hover:shadow-md'}
        `}>
            {/* Decoración lateral */}
            {!isPast && <div className="absolute left-0 top-0 bottom-0 w-1 bg-foreground" />}

            <div className="flex justify-between items-start mb-3 pl-2">
                {/* FECHA GRANDE */}
                <div className="flex gap-3 items-center">
                    <div className="text-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 min-w-[60px]">
                        <span className="block text-xs uppercase text-muted font-bold tracking-wider">{monthName.slice(0,3)}</span>
                        <span className="block text-xl font-bold text-foreground leading-none">{dayNumber}</span>
                    </div>
                    <div>
                        <p className="font-bold text-lg capitalize text-foreground">{dayName}</p>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                            <Clock size={14} />
                            <span>{timeString}h</span>
                        </div>
                    </div>
                </div>
                
                <StatusBadge status={booking.status} />
            </div>

            <div className="space-y-1.5 pl-2 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm items-center">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Scissors size={14} />
                        <span>Servicio</span>
                    </div>
                    <span className="font-medium text-foreground">
                        {booking.booking_items[0]?.services?.title || 'Varios'}
                    </span>
                </div>
                <div className="flex justify-between text-sm items-center">
                     <div className="flex items-center gap-2 text-gray-600">
                        <User size={14} />
                        <span>Profesional</span>
                    </div>
                    <span className="font-medium text-foreground">
                        {booking.staff?.full_name || 'Cualquiera'}
                    </span>
                </div>
            </div>
            
            {!isPast && (
                <div className="mt-3 pl-2 pt-2 flex justify-end">
                     <button className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
                        Ver detalles <ArrowRight size={12}/>
                     </button>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        confirmed: "bg-green-50 text-green-700 border-green-100",
        pending_payment: "bg-orange-50 text-orange-700 border-orange-100",
        cancelled: "bg-red-50 text-red-600 border-red-100",
        completed: "bg-gray-100 text-gray-500 border-gray-200"
    };

    const labels: Record<string, string> = {
        confirmed: "Confirmada",
        pending_payment: "Pago Pendiente",
        cancelled: "Cancelada",
        completed: "Finalizada"
    };

    return (
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border ${styles[status] || styles.completed}`}>
            {labels[status] || status}
        </span>
    );
}

function SearchIcon({ className, size }: { className?: string, size?: number }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    )
}