'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { urlBase64ToUint8Array } from '@/utils/push';
import { toast } from 'sonner'; 
import { Booking } from '../booking/BookingModal';
import { BellRing, PlusSquare, Share, X } from 'lucide-react';
import { SITE_CONFIG } from '@/config';

interface PushManagerProps {
  customerId: string;
  email: string;
  asModal?: boolean
}

export default function PushNotificationManager({ customerId, email, asModal = false }: PushManagerProps) {
  const { isIOS, isStandalone, isInstallable, installPWA } = usePWA();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [ appleModal, setAppleModal ] = useState<boolean>(false)
  const [ showMainModal, setShowMainModal ] = useState<boolean>(true)

  // 1. Chequeo inicial
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          if (subscription) {
            setIsSubscribed(true)
            setShowMainModal(false)
          }
        });
      });
    }
  }, [asModal]);

  const handleCloseMainModal = () => {
    setShowMainModal(false)
  }

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
      setShowMainModal(false)

    } catch (error: any) {
      console.error('Error Push:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Has bloqueado las notificaciones. Revísalo en ajustes.');
      } else {
        toast.error('Error al activar notificaciones.');
        console.log(error)
      }
    } finally {
      setLoading(false);
    }
  };

  const AppleModalInstructions = () => {
    return (
      <div className="fixed inset-0 z-[99999] flex items-end justify-center sm:items-center p-4 bg-background/60 backdrop-blur-sm stagger-container text-left">
        <div className="bg-background w-full max-w-sm rounded-3xl shadow-2xl relative overflow-hidden border border-foreground/10 flex flex-col animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 p-6 stagger-container">
          
          <button 
            onClick={() => setAppleModal(false)}
            className="absolute top-4 right-4 p-2 bg-background-secondary rounded-full text-muted hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center mt-2">
            <h3 className="font-title text-2xl font-bold text-foreground mb-2">Instala la App</h3>
            <p className="text-sm text-muted mb-6">
              Para recibir recordatorios en tu iPhone, necesitas añadir esta página a tu pantalla de inicio.
            </p>

            <div className="w-full bg-background-secondary p-4 rounded-2xl border border-foreground/5 space-y-4 text-left">
              <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                <div className="bg-background p-2 rounded-lg shadow-sm border border-foreground/5 text-primary">
                  <Share size={18} />
                </div>
                <span>1. Toca en el icono de <b>Compartir.</b></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                <div className="bg-background p-2 rounded-lg shadow-sm border border-foreground/5 text-primary">
                  <PlusSquare size={18} />
                </div>
                <span>2. Dale a <b>Añadir a inicio</b>.</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground font-medium">
                <div className="bg-background p-2 rounded-lg shadow-sm border border-foreground/5 text-primary">
                  <BellRing size={18} />
                </div>
                <span>3. Abre la App, ve a reserva, introduce tu email en el buscador y pulsa <b>Activar Recordatorios</b>.</span>
              </div>
            </div>

            <button 
              onClick={() => setAppleModal(false)}
              className="mt-6 w-full py-3.5 rounded-xl font-bold text-foreground bg-background-secondary border border-foreground/10 hover:bg-foreground/5 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    )
  }


  // ==========================================
  // RENDERIZADO 1: MODO MODAL (Desde /reserva)
  // ==========================================
  if (asModal) {
      // Si ya está suscrito, no mostramos nada.
      // Si NO está suscrito y showMainModal es true (por defecto), mostramos el modal.
      if (isSubscribed || !showMainModal) return null;

      return (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            {appleModal && <AppleModalInstructions />}
            
            <div className="bg-background w-full max-w-sm rounded-3xl shadow-2xl relative overflow-hidden border border-foreground/10 flex flex-col p-8 text-center animate-in zoom-in-95 duration-300">
                
                {/* Al cerrar aquí, solo se cierra por esta vez. Si recarga, vuelve a salir. */}
                <button onClick={handleCloseMainModal} className="absolute top-4 right-4 p-2 bg-background-secondary rounded-full text-muted hover:text-foreground transition-colors">
                    <X size={18} />
                </button>

                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 text-primary">
                    <BellRing size={32} className="animate-pulse" />
                </div>
                
                <h3 className="font-title text-2xl font-bold text-foreground mb-2">¡No olvides tu cita!</h3>
                <p className="text-sm text-muted mb-8">
                    Activa las notificaciones y te enviaremos un recordatorio a tu móvil 24 horas antes de tu turno.
                </p>
                
                <button 
                    onClick={(isIOS && !isStandalone) ? () => setAppleModal(true) : subscribeUser}
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? 'Activando...' : 'Activar Recordatorios'}
                </button>
                
                <button onClick={handleCloseMainModal} className="mt-4 text-sm font-bold text-muted hover:text-foreground transition-colors">
                    Ahora no
                </button>
            </div>
        </div>
      );
  }

  // CASO A: iPhone sin instalar App
  if (isIOS && !isStandalone) {
    return (
      <div className="flex items-center justify-between p-3 bg-background-secondary border border-foreground/10 rounded-xl">
        {
          appleModal && <AppleModalInstructions />
        }
        <div className="text-left">
            <div className="flex items-center gap-1.5 mb-0.5">
              <BellRing size={16} className='text-foreground' />
              <span className="text-sm font-bold text-foreground">Recordatorios</span>
            </div>
            <p className="text-[12px] text-muted">Te avisamos 24h antes.</p>
        </div>
        
        <button
          onClick={() => setAppleModal(true)} 
          disabled={loading}
          className="bg-primary text-foreground px-4 py-2 rounded-lg text-xs font-bold hover:bg-foreground/90 transition-all disabled:opacity-50"
        >
          {loading ? '...' : 'Activar'}
        </button>
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
        className="bg-primary text-foreground px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
      >
        {loading ? '...' : 'Activar'}
      </button>
    </div>
  );
}