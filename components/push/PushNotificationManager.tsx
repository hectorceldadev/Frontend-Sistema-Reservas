'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';   // Nuestro gancho detector
import { urlBase64ToUint8Array } from '@/utils/push'; // El traductor
import { toast } from 'sonner'; 
import { Booking } from '../booking/BookingModal';
import { format } from 'date-fns';

interface PushManagerProps {
  booking: Booking
  customerId: string;
  email: string;
}

export default function PushNotificationManager({ customerId, email, booking }: PushManagerProps) {
  const { isIOS, isStandalone, isInstallable, installPWA } = usePWA();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. AL CARGAR: Comprobar si YA estaba suscrito de antes
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          // Si subscription existe, es que ya tiene permiso
          if (subscription) setIsSubscribed(true);
        });
      });
    }
  }, []);

  // 2. ACCIÓN: El usuario pulsa el botón
  const subscribeUser = async () => {
    // Protección: Si no hay soporte (ej: HTTP no seguro), avisamos
    if (!('serviceWorker' in navigator)) {
        toast.error('Tu navegador no soporta notificaciones push.');
        return;
    }

    setLoading(true);

    try {
      // A. REGISTRAR EL CONSERJE (Service Worker)
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // B. PEDIR PERMISO (Sale el popup del navegador)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // Prometemos que siempre mostraremos algo visual
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      });

      // C. GUARDAR EN LA AGENDA (Supabase)
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            subscription,
            email,
            userAgent: navigator.userAgent,
            customerId
        })
      }) 

      
      if (!response.ok) throw new Error('Error al guardar la suscripción en servidor')

      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email,
          title: '✅ ¡Reserva Confirmada!',
          message: `Hola ${booking.client?.name}, tu cita es el ${format(booking.date!, 'dd/MM')} a las ${booking.time}.`,
          url: window.location.origin //* AQUI PODRIAMOS PLANTEAR LA IDEA DE SITIO FANTASMA 
        })
      })

      setIsSubscribed(true);
      toast.success('¡Recordatorios activados!');
        

    } catch (error: any) {
      console.error('Error Push:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Has bloqueado las notificaciones. Revísalo en la configuración.');
      } else {
        toast.error('Error al activar notificaciones.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERIZADO (¿Qué mostramos?) ---

  // CASO 1: iPhone que NO ha instalado la App -> INSTRUCCIONES
  if (isIOS && !isStandalone) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
        <h3 className="font-bold text-gray-900 mb-2">📲 Activa los recordatorios</h3>
        <p className="text-sm text-gray-600 mb-2">
          En iPhone, necesitas instalar la App primero.
        </p>
        <div className="text-xs text-gray-500 bg-white p-2 rounded border inline-block">
            Pulsar <strong>Compartir</strong> <span className="text-lg">⎋</span> &rarr; <strong>Añadir a inicio</strong>
        </div>
      </div>
    );
  }

  // CASO 2: Ya suscrito (Éxito)
  if (isSubscribed) {
    return (
      <div className="text-center space-y-3">
        <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 flex items-center justify-center gap-2 font-medium">
           <span>🔔</span> Notificaciones activas
        </div>
        
        {/* Extra: Si es Android y aún no instaló la App, le ofrecemos instalar */}
        {isInstallable && (
           <button onClick={installPWA} className="text-sm text-gray-500 underline">
             Instalar App en el móvil
           </button>
        )}
      </div>
    );
  }

  // CASO 3: Normal (Botón de activar)
  return (
    <div className="p-4 bg-brand/5 rounded-xl border border-brand/10 text-center">
      <h3 className="font-semibold text-brand mb-1">🔔 No te pierdas tu cita</h3>
      <p className="text-xs text-gray-500 mb-4">Te avisaremos gratis al móvil.</p>
      
      <button
        onClick={subscribeUser}
        disabled={loading}
        className="bg-foreground text-background px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors w-full disabled:opacity-50"
      >
        {loading ? 'Activando...' : 'Activar Recordatorios'}
      </button>
    </div>
  );
}