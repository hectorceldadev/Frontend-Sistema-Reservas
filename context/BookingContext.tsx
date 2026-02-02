'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface BookingContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <BookingContext.Provider value={{ isOpen, openModal, closeModal }}>
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