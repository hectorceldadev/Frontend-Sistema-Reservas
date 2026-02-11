'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

interface BookingContextType {
  isOpen: boolean;
  preSelectedServiceId: string | null; // <--- 1. NUEVO ESTADO
  openModal: (serviceId?: string) => void; // <--- 2. ACEPTA UN ID OPCIONAL
  closeModal: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [preSelectedServiceId, setPreSelectedServiceId] = useState<string | null>(null);

  // Modificamos openModal para recibir el ID
  const openModal = useCallback((serviceId?: string) => {
    if (serviceId) {
      setPreSelectedServiceId(serviceId);
    } else {
      setPreSelectedServiceId(null); // Limpiamos si se abre genérico
    }
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Opcional: Limpiar el ID al cerrar con un pequeño delay para que no salte la UI
    setTimeout(() => setPreSelectedServiceId(null), 300);
  }, []);

  const value = useMemo(() => ({
    isOpen,
    preSelectedServiceId,
    openModal,
    closeModal
  }), [isOpen, preSelectedServiceId, openModal, closeModal])

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking debe usarse dentro de un BookingProvider');
  }
  return context;
}