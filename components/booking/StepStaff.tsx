'use client';

import { Users, Check, Sparkles, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Booking, Profile } from './BookingModal';

// Borramos MOCK DATA

interface StepStaffProps {
  booking: Booking;
  setBooking: (data: Booking) => void;
  staffList: Profile[]; // Lista real
  isLoading: boolean;
}

const ROLE_MAP: Record<string, string> = {
  admin: 'Gerente / Top Barber',
  worker: 'Estilista Profesional',
  any: 'Primer hueco libre' // Para la opción "Cualquiera"
};

export default function StepStaff({ booking, setBooking, staffList, isLoading }: StepStaffProps) {
  
  const handleSelect = (member: Profile) => {
    setBooking({ ...booking, staff: member });
  };

  if (isLoading) {
    return (
        <div className="flex justify-center p-8">
            <Loader2 className='animate-spin text-muted'/>
        </div>
    )
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
      
      <div className="flex items-center justify-between stagger-container">
        <h3 className="text-xl font-bold font-title text-foreground">
            Escoge un profesional
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 stagger-container">
        {staffList.map((member: Profile) => {
          const isSelected = booking.staff?.id === member.id;
          const isAny = member.id === 'any';

          return (
            <button
              key={member.id}
              onClick={() => handleSelect(member)}
              className={cn(
                // BASE
                "relative flex flex-col items-center p-4 rounded-3xl border transition-all duration-300 text-center group overflow-hidden",
                "bg-background-secondary",
                // HOVER
                "hover:scale-[1.02] hover:shadow-lg hover:border-foreground/20",
                // SELECCIONADO
                isSelected 
                  ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20" 
                  : "border-foreground hover:border-foreground/10"
              )}
            >
              {/* Check flotante */}
              <div className={cn(
                  "absolute top-3 right-3 z-10 bg-primary text-background rounded-full p-1.5 transition-all duration-300 shadow-sm",
                  isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"
              )}>
                  <Check size={14} strokeWidth={3} />
              </div>

              {/* AVATAR CONTAINER */}
              <div className={cn(
                "relative w-24 h-24 mb-4 rounded-full overflow-hidden transition-all duration-300 shadow-sm",
                isSelected 
                    ? "ring ring-foreground shadow-md scale-105" 
                    : "ring ring-transparent grayscale-30 group-hover:grayscale-0 group-hover:scale-105"
              )}>
                  {/* Lógica de imagen: Si es 'any' o no tiene foto, mostramos icono. Si tiene foto, la mostramos */}
                  {isAny || !member.avatar_url ? (
                      <div className={cn(
                          "w-full h-full flex items-center justify-center transition-colors",
                          isSelected ? "bg-primary text-background" : "bg-foreground/5 text-muted group-hover:bg-foreground/10"
                      )}>
                          {isAny ? (
                              isSelected ? <Sparkles size={32} /> : <Users size={32} />
                          ) : (
                              // Icono genérico para usuario sin foto
                              <User size={32} />
                          )}
                      </div>
                  ) : (
                      <Image 
                        src={member.avatar_url} 
                        alt={member.full_name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                  )}
              </div>

              {/* TEXTOS */}
              <div className="space-y-1 z-10">
                  <span className={cn(
                      "font-bold font-title text-lg block transition-colors capitalize", // Capitalize para nombres propios
                      isSelected ? "text-primary" : "text-foreground"
                  )}>
                      {member.full_name}
                  </span>
                  <span className={cn(
                      "text-xs font-medium block transition-colors capitalize",
                      isSelected ? "text-primary/80" : "text-muted"
                  )}>
                      {isAny ? ROLE_MAP['any'] : (ROLE_MAP[member.role] || member.role)}
                  </span>
              </div>
              
              {isSelected && (
                  <div className="absolute inset-0 bg-primary/5 z-0 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}