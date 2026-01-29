'use client';

import { useEffect, useState } from "react";

// 1. DEFINICIÓN ROBUSTA DE TIPOS
// Definimos el evento especial de Chrome
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Definimos la propiedad 'standalone' que Apple se inventó y no es estándar
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export function usePWA() {
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Verificamos que estamos en el navegador para evitar errores en servidor
    if (typeof window === 'undefined') return;

    // --- DETECTAR IOS ---
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    
    setIsIOS(isIosDevice);
    

    // --- DETECTAR STANDALONE ---
    const nav = window.navigator as NavigatorWithStandalone;
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || !!nav.standalone; // El !! convierte undefined en false

    setIsStandalone(isStandaloneMode);

    // --- EVENTO INSTALL PROMPT (Android/Chrome) ---
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  return { isIOS, isInstallable, isStandalone, installPWA };
}