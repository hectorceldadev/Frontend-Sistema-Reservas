'use client';

import { Check, Clock, LoaderIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Booking, Service } from './BookingModal';
import { ServiceDB } from '@/lib/types/databaseTypes';

interface StepServiceProps {
  booking: Booking;
  setBooking: (data: Booking) => void;
  servicesList: ServiceDB[]
  isLoading: boolean
}

export default function StepService({ booking, setBooking, isLoading, servicesList }: StepServiceProps) {
  
  const handleToggle = (service: Service) => {
    const currentServices = booking.services || [];
    const exists = currentServices.find((s: Service) => s.id === service.id);

    let newServices;
    if (exists) {
      newServices = currentServices.filter((s: Service) => s.id !== service.id);
    } else {
      newServices = [...currentServices, service];
    }
    setBooking({ ...booking, services: newServices });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in duration-500 stagger-container">
        <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold font-title text-foreground">
            Selecciona servicios
        </h3>
      </div>
        {/* Generamos 4 esqueletos */}
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="w-full p-8 rounded-2xl border border-foreground/50 bg-background-secondary flex items-start gap-4"
          >
            {/* Checkbox Skeleton */}
            <div className="mt-1 w-5 h-5 rounded-full bg-muted animate-pulse shrink-0" />
            
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start w-full">
                {/* Título Skeleton */}
                <div className="h-5 w-3/4 bg-muted animate-pulse rounded-md" />
                {/* Precio Skeleton */}
                <div className="h-5 w-12 bg-muted animate-pulse rounded-md" />
              </div>
              
              {/* Descripción Skeleton */}
              <div className="h-3 w-1/2 bg-muted/50 animate-pulse rounded-md" />
              
              {/* Duración Skeleton */}
              <div className="flex items-center gap-1 pt-1">
                <div className="w-3 h-3 rounded-full bg-muted/50 animate-pulse" />
                <div className="h-3 w-16 bg-muted/50 animate-pulse rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500 pb-4">
      
      {/* CABECERA SIMPLE */}
      <div className="flex items-center justify-between stagger-container">
        <h3 className="text-xl font-bold font-title text-foreground">
            Selecciona servicios
        </h3>
        {/* Badge opcional */}
        <span className="text-xs font-medium px-2 py-1 bg-background-secondary rounded-full text-muted border border-foreground/5">
            {booking.services.length} Seleccionados
        </span>
      </div>
      
      {/* GRID DE SERVICIOS */}
      <div className="grid grid-cols-1 gap-4 stagger-container">
        {servicesList.map((service) => {
          const isSelected = booking.services?.some((s: Service) => s.id === service.id);
          
          return (
            <div
              key={service.id}
              onClick={() => handleToggle(service)}
              className={cn(
                "group relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 ease-out",
                "bg-background-secondary", 
                "hover:scale-[1.01] hover:shadow-lg",
                isSelected 
                  ? "border-primary group-hover:border-2 shadow-md" 
                  : "border-foreground hover:border-foreground/10"
              )}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-2">
                  <h4 className={cn(
                      "font-bold font-title text-lg transition-colors",
                      isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                  )}>
                    {service.title}
                  </h4>
                  <p className="text-sm text-muted leading-relaxed line-clamp-2">
                    {service.short_desc}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md bg-foreground/5 text-muted">
                    <Clock size={13} />
                    <span>{service.duration} min</span>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between self-stretch min-h-20">
                    <span className="text-xl font-bold font-title text-foreground">
                        {service.price}€
                    </span>
                    <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                        isSelected 
                            ? "bg-primary text-background scale-100 opacity-100" 
                            : "border-2 border-muted/30 text-transparent scale-100"
                    )}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}