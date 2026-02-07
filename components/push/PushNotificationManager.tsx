'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { urlBase64ToUint8Array } from '@/utils/push';
import { toast } from 'sonner'; 
import { Booking } from '../booking/BookingModal';
import { BellRing } from 'lucide-react';
import { SITE_CONFIG } from '@/config';

interface PushManagerProps {
  customerId: string;
  email: string;
  booking?: Booking;
}

export default function PushNotificationManager({ customerId, email }: PushManagerProps) {
  const { isIOS, isStandalone, isInstallable, installPWA } = usePWA();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Chequeo inicial
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          if (subscription) setIsSubscribed(true);
        });
      });
    }
  }, []);

  // 2. Lógica de Suscripción + Notificación Inmediata
  const subscribeUser = async () => {
    if (!('serviceWorker' in navigator)) {
        toast.error('Tu navegador no soporta notificaciones push.');
        return;
    }

    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      });

      // A. Guardar en Base de Datos
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          email,
          userAgent: navigator.userAgent,
          customerId,
          businessId: SITE_CONFIG.supabaseData.businessId
        })
      });

      if (!response.ok) throw new Error('Error al guardar suscripción');

      // B. Enviar "Reserva Confirmada" al instante
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          title: '✅ ¡Reserva Confirmada!',
          message: 'Gracias por activar los avisos. Te recordaremos tu cita por aquí.',
          url: `${window.location.origin}/reserva`
        })
      });

      setIsSubscribed(true);
      toast.success('¡Recordatorios activados!');

    } catch (error: any) {
      console.error('Error Push:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Has bloqueado las notificaciones. Revísalo en ajustes.');
      } else {
        toast.error('Error al activar notificaciones.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERIZADO (Horizontal y Compacto) ---

  // CASO A: iPhone sin instalar App
  if (isIOS && !isStandalone) {
    return (
      <div className="flex items-center justify-between p-3 bg-background-secondary border border-foreground/10 rounded-xl">
        <div className="text-left">
            <p className="text-xs font-bold text-foreground">Instalar App</p>
            <p className="text-[10px] text-muted">Para recibir avisos en iPhone</p>
        </div>
        <div className="text-[10px] font-medium bg-primary hover:bg-secondary px-2 py-1.5 rounded border border-foreground/10 shadow-sm text-background">
            Compartir ⎋ + Inicio
        </div>
      </div>
    );
  }

  // CASO B: Ya suscrito (Verde)
  if (isSubscribed) {
    return (
      <div className="flex items-center justify-center gap-2 p-1 bg-background-secondary border border-foreground/20 rounded-xl text-foreground">
         <BellRing size={14}  className='rotate-10'/>
         <span className="text-sm font-bold">Recordatorios activos</span>
         {isInstallable && (
           <button onClick={installPWA} className="ml-2 text-[10px] underline hover:text-green-900">
             Instalar App
           </button>
         )}
      </div>
    );
  }

  // CASO C: Normal (Activar)
  return (
    <div className="flex items-center justify-between p-3 bg-background-secondary border border-foreground/10 rounded-xl">
      <div className="text-left">
          <div className="flex items-center gap-1.5 mb-0.5">
            <BellRing size={16} className='text-foreground' />
            <span className="text-sm font-bold text-foreground">Recordatorios</span>
          </div>
          <p className="text-[12px] text-muted">Te avisamos 24h antes.</p>
      </div>
      
      <button
        onClick={subscribeUser}
        disabled={loading}
        className="bg-primary text-foreground px-4 py-2 rounded-lg text-xs font-bold hover:bg-foreground/90 transition-all disabled:opacity-50"
      >
        {loading ? '...' : 'Activar'}
      </button>
    </div>
  );
}