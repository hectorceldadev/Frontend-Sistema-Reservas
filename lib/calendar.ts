import { Booking } from "@/components/booking/BookingModal";

// Helper mejorado para formatear fechas al estándar ICS (YYYYMMDDTHHMMSS)
// Usamos los métodos locales (getFullYear, etc) para evitar que la conversión a UTC
// cambie la hora si el servidor y el usuario están en zonas distintas.
const formatDateForCalendar = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = '00';

  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
};

export const generateGoogleCalendarUrl = (booking: Booking) => {
  if (!booking.date || !booking.time) return '#';
  
  const [hours, minutes] = booking.time.split(':').map(Number);
  const startDate = new Date(booking.date);
  startDate.setHours(hours, minutes, 0);

  const totalDuration = booking.services.reduce((acc, s) => acc + s.duration, 0) || 60;
  const endDate = new Date(startDate.getTime() + totalDuration * 60000);

  // Google necesita formato UTC (Z) a menudo, o local. 
  // Tu método anterior funcionaba bien para Google, lo mantenemos similar pero seguro.
  const startStr = formatDateForCalendar(startDate);
  const endStr = formatDateForCalendar(endDate);

  const title = encodeURIComponent("Cita en Barbería Estilo");
  const servicesList = booking.services.map(s => s.title).join(', ');
  const details = encodeURIComponent(`Servicios: ${servicesList}\nProfesional: ${booking.staff?.full_name || 'Cualquiera'}`);
  const location = encodeURIComponent("Calle Falsa 123, Madrid"); 

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}&sf=true&output=xml`;
};

export const downloadIcsFile = (booking: Booking) => {
  if (!booking.date || !booking.time) return;

  const [hours, minutes] = booking.time.split(':').map(Number);
  const startDate = new Date(booking.date);
  startDate.setHours(hours, minutes, 0);

  const totalDuration = booking.services.reduce((acc, s) => acc + s.duration, 0) || 60;
  const endDate = new Date(startDate.getTime() + totalDuration * 60000);

  const now = new Date();

  // Construimos el contenido línea a línea
  const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Barberia Estilo//NONSGML v1.0//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:booking-${booking.date.getTime()}-${Date.now()}@barberiaestilo.com`,
      `DTSTAMP:${formatDateForCalendar(now)}`,
      `DTSTART:${formatDateForCalendar(startDate)}`,
      `DTEND:${formatDateForCalendar(endDate)}`,
      'SUMMARY:Cita en Barbería Estilo',
      `DESCRIPTION:Has reservado los siguientes servicios: ${booking.services.map(s => s.title).join(', ')}. \\nTe atiende: ${booking.staff?.full_name}.`,
      'LOCATION:Calle Falsa 123, Madrid',
      `URL:${window.location.origin}`, // Enlace a tu web
      'STATUS:CONFIRMED',
      
      // --- SECCIÓN DE ALARMA (Esto hace que vibre el móvil) ---
      'BEGIN:VALARM',
      'TRIGGER:-PT30M', // 30 Minutos antes (P=Period, T=Time, 30M=30 Minutes)
      'ACTION:DISPLAY',
      'DESCRIPTION:Recordatorio de tu cita',
      'END:VALARM',
      // --------------------------------------------------------

      'END:VEVENT',
      'END:VCALENDAR'
  ].join('\r\n'); // \r\n es el salto de línea estándar para archivos ICS

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'cita-barberia.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};