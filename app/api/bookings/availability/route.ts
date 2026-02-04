import { createClient } from "@supabase/supabase-js";
import { getDay } from "date-fns";
import { NextResponse } from "next/server";

// ----------------------------------------------------------------------
// 1. CONFIGURACIÓN DE SUPABASE
// ----------------------------------------------------------------------
// Usamos el 'service_role_key' porque necesitamos permisos de administrador
// para ver los horarios y citas de TODOS los empleados, sin restricciones
// de Row Level Security (RLS) que aplicarían a un usuario normal.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ----------------------------------------------------------------------
// 2. FUNCIÓN PRINCIPAL (GET)
// ----------------------------------------------------------------------
export async function GET(request: Request) {
    try {
        // --- A. EXTRACCIÓN Y VALIDACIÓN DE PARÁMETROS ---
        const { searchParams } = new URL(request.url)
        
        const date = searchParams.get('date')          // Formato esperado: YYYY-MM-DD
        const staffId = searchParams.get('staffId')    // Puede ser un UUID o el string 'any'
        const duration = parseInt(searchParams.get('duration') || '30') // Duración del servicio en minutos
        const businessId = searchParams.get('businessId') // ID del negocio para filtrar

        // Si faltan datos críticos, detenemos la ejecución.
        if (!date || !businessId) {
            return NextResponse.json({ error: 'Faltan parámetros obligatorios (date o businessId)' }, { status: 400 })
        }

        // --- B. PREPARACIÓN DE VARIABLES DE TIEMPO ---
        // Creamos un objeto Date para saber qué día de la semana es (0=Domingo, 1=Lunes...)
        // Esto es necesario para buscar en la tabla 'staff_schedules'.
        const selectedDate = new Date(date)
        const dayOfWeek = getDay(selectedDate)

        // --- C. OBTENER HORARIOS DE TRABAJO (SCHEDULES) ---
        // Primero, averiguamos QUIÉN trabaja ese día y en qué horario.
        let scheduleQuery = supabaseAdmin
            .from('staff_schedules')
            .select('*')
            .eq('business_id', businessId)
            .eq('day_of_week', dayOfWeek)
            .eq('is_working', true) // Solo queremos a los que trabajan hoy

        // LÓGICA FILTRO STAFF:
        // Si el usuario eligió un empleado específico (y no es 'any'), filtramos solo su horario.
        // Si eligió 'any', no aplicamos este filtro y traemos los horarios de TODOS.
        if (staffId && staffId !== 'any') {
            scheduleQuery = scheduleQuery.eq('staff_id', staffId)
        }

        const { data: schedules, error: scheduleError } = await scheduleQuery
        
        // Si hay error o el array está vacío (nadie trabaja hoy), devolvemos array vacío.
        if (scheduleError || !schedules || schedules.length === 0) {
            return NextResponse.json({ slots: [] }) 
        }

        // --- D. OBTENER CITAS EXISTENTES (BOOKINGS) ---
        // Ahora necesitamos saber qué huecos están YA ocupados.
        // Optimizamos: Solo buscamos citas de los empleados que sabemos que trabajan hoy.
        const workingStaffIds = schedules.map(s => s.staff_id)
        
        const { data: bookings } = await supabaseAdmin
            .from('bookings')
            .select('start_time, end_time, staff_id') // Solo necesitamos saber cuándo empieza/acaba y de quién es
            .eq('business_id', businessId)
            .eq('date', date) // Filtramos por la fecha exacta
            .in('staff_id', workingStaffIds) // Solo de los empleados activos hoy
            .neq('status', 'cancelled') // Ignoramos citas canceladas (dejan el hueco libre)
            .neq('status', 'rejected')  // Ignoramos citas rechazadas

        // --- E. PREPARACIÓN DEL ALGORITMO ---
        const INTERVAL = 30; // Saltos de tiempo para generar los huecos (ej: 09:00, 09:30, 10:00...)
        
        // Helper: Convierte hora texto ("09:30") a minutos totales desde medianoche (570)
        // Esto facilita enormemente las comparaciones matemáticas (mayor que, menor que).
        const timeToMins = (t: string) => {
            const [h, m] = t.split(':').map(Number)
            return h * 60 + m
        }

        // Buscamos los límites globales del día.
        // Si un empleado abre a las 08:00 y otro a las 10:00, empezamos a mirar desde las 08:00.
        // Si uno cierra a las 18:00 y otro a las 20:00, miramos hasta las 20:00.
        let minStart = 24 * 60; // Inicializamos alto para encontrar el mínimo
        let maxEnd = 0;         // Inicializamos bajo para encontrar el máximo

        schedules.forEach(s => {
            const sStart = timeToMins(s.start_time)
            const sEnd = timeToMins(s.end_time)
            if (sStart < minStart) minStart = sStart
            if (sEnd > maxEnd) maxEnd = sEnd
        })

        const availableSlots: string[] = []

        // --- F. EL NÚCLEO DEL ALGORITMO (DOBLE BUCLE) ---
        // 1. Iteramos por cada bloque de tiempo posible del día (ej: 09:00, 09:30...)
        // Restamos la duración al final para asegurar que el servicio "cabe" antes de cerrar.
        for (let currentMins = minStart; currentMins <= maxEnd - duration; currentMins += INTERVAL) {
            
            const slotStartMins = currentMins
            const slotEndMins = currentMins + duration
            let isSlotFree = false // Asumimos que está ocupado hasta demostrar lo contrario

            // 2. Para ESTE hueco de tiempo, revisamos empleado por empleado.
            // Si staffId='any', revisamos a todos. Si es específico, el array 'schedules' solo tiene 1.
            for (const schedule of schedules) {
                
                // --- VALIDACIÓN 1: HORARIO LABORAL ---
                const shiftStart = timeToMins(schedule.start_time)
                const shiftEnd = timeToMins(schedule.end_time)

                // Si el servicio empieza antes de que este empleado llegue o termina después de que se vaya...
                // este empleado NO sirve. Pasamos al siguiente (continue).
                if (slotStartMins < shiftStart || slotEndMins > shiftEnd) continue;

                // --- VALIDACIÓN 2: DESCANSO ---
                if (schedule.break_start && schedule.break_end) {
                    const breakStart = timeToMins(schedule.break_start)
                    const breakEnd = timeToMins(schedule.break_end)
                    
                    // Si el hueco se solapa con el descanso (ni que sea 1 minuto), no sirve.
                    if (slotStartMins < breakEnd && slotEndMins > breakStart) continue;
                }

                // --- VALIDACIÓN 3: CONFLICTO CON OTRAS CITAS ---
                // Filtramos las citas que pertenecen a ESTE empleado específico.
                const staffBookings = bookings?.filter(b => b.staff_id === schedule.staff_id) || []

                const hasConflict = staffBookings.some(booking => {
                    const bStart = new Date(booking.start_time)
                    const bEnd = new Date(booking.end_time)
                    
                    // ZONA HORARIA CRÍTICA:
                    // Usamos UTC porque Supabase guarda en formato ISO con Z (Zulu time).
                    // Esto evita errores si tu servidor está en una zona horaria diferente a la DB.
                    const bStartMins = bStart.getUTCHours() * 60 + bStart.getUTCMinutes()
                    const bEndMins = bEnd.getUTCHours() * 60 + bEnd.getUTCMinutes()

                    // Fórmula de superposición de rangos:
                    // (NuevoInicio < ViejoFinal) Y (NuevoFinal > ViejoInicio)
                    return (slotStartMins < bEndMins && slotEndMins > bStartMins)
                })

                // --- CONCLUSIÓN PARA ESTE EMPLEADO ---
                // Si ha pasado todas las pruebas (trabaja, no descansa, no tiene citas):
                if (!hasConflict) {
                    isSlotFree = true
                    break; // ¡ÉXITO! Encontramos un hueco. No hace falta mirar más empleados para esta hora.
                }
            }

            // Si al menos un empleado estaba libre, guardamos la hora.
            if (isSlotFree) {
                // Convertimos minutos de vuelta a formato "HH:MM"
                const h = Math.floor(currentMins / 60).toString().padStart(2, '0')
                const m = (currentMins % 60).toString().padStart(2, '0')
                availableSlots.push(`${h}:${m}`)
            }
        }

        // Devolvemos la lista limpia de huecos disponibles
        return NextResponse.json({ slots: availableSlots })

    } catch (error) {
        console.error('Error calculando disponibilidad:', error)
        return NextResponse.json({ error }, { status: 500 })
    }
}