import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { format } from "date-fns";

// Inicializamos Supabase con permisos de Admin (Service Role)
// Esto nos permite leer bookings de TODOS los negocios saltándonos el RLS.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  
)

// Configuración de Vercel
// force-dynamic: Evita que Vercel cachee esta respuesta. Siempre ejecuta en vivo.
export const dynamic = 'force-dynamic'
// maxDuration: 60 segundos (Límite del Plan Pro). En Hobby se ignora (son 10s).
export const maxDuration = 60

export async function GET(request: Request) {

    const startTime = Date.now()

    try {
        // 1. SEGURIDAD: Verificar que quien llama es Vercel Cron
        // Si no tienes CRON_SECRET en .env.local, esta comprobación se salta (peligroso en producción)
        const authHeader = request.headers.get('authorization')
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. CALCULAR FECHA DE MAÑANA
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const dateString = format(tomorrow, 'yyyy-MM-dd')

        console.log(`[CRON MASTER] Iniciando proceso para: ${dateString}`)

        // 3. CONSULTA INTELIGENTE (JOIN)
        // Traemos: Reserva + Nombre Negocio + Items (Servicios) + Staff
        const { data: bookings, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                id,
                start_time,
                customer_email,
                customer_name,
                business:businesses(name),
                items:booking_items(service_name, price), 
                staff:profiles(full_name)
            `)
            .eq('date', dateString)
            .eq('status', 'confirmed')
        
        if (error) {
            console.error('Error Supabase: ', error)
            throw error
        }

        if (!bookings || bookings.length === 0) {
            console.log('[CRON MASTER] No hay reservas para mañana.')
            return NextResponse.json({ message: 'Sin reservas para mañana' })
        }

        console.log(`[CRON MASTER] Procesando ${bookings.length} envios...`)

        // 4. PREPARAR URL BASE
        // Necesaria porque fetch en servidor requiere URL absoluta (http://...)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

        // 5. PROCESAMIENTO PARALELO (MAP)
        // Creamos un array de promesas. No usamos 'await' aquí dentro para que
        // todas las peticiones salgan disparadas a la vez.
        const promises = bookings.map(async (booking) => {
            const timeString = format(new Date(booking.start_time), 'HH:mm')
            
            // @ts-ignore
            const businessName = booking.business?.name || 'Su centro'
            // @ts-ignore
            const staffName = booking.staff?.full_name || 'El equipo'
            
            // @ts-ignore
            const servicesList = booking.items?.map((i: any) => i.service_name) || []
            // @ts-ignore
            const totalPrice = booking.items?.reduce((acc: number, i: any) => acc + i.price, 0) || 0

            // A. Promesa de Notificación Push
            // Usamos la URL absoluta construida arriba
            const pushPromise = fetch(`${appUrl}/api/notifications/send`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: booking.customer_email,
                    title: `⏰ Recordatorio ${businessName}`,
                    message: `Hola ${booking.customer_name}, mañana tienes cita a las ${timeString}`,
                    url: `${appUrl}/reserva`
                })
            })

            // B. Promesa de Email
            const emailPromise = fetch(`${appUrl}/api/emails`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    customerName: booking.customer_name, 
                    email: booking.customer_email, 
                    date: format(new Date(booking.start_time), 'dd/MM/yyyy'), 
                    time: timeString, 
                    services: servicesList, 
                    price: totalPrice, 
                    staffName: staffName
                })
            })

            // Devolvemos una promesa combinada. 
            // Esto significa: "Avísame cuando el push Y el email hayan terminado"
            return Promise.all([pushPromise, emailPromise])
        })

        // 6. ESPERAR A TODOS (Promise.allSettled)
        // Esperamos a que terminen TODOS los envíos antes de cerrar el script.
        // allSettled es mejor que all porque si falla uno, no cancela los demás.
        const results = await Promise.allSettled(promises)

        const successCount = results.filter(r => r.status === 'fulfilled').length
        const failCount = results.filter(r => r.status === 'rejected').length

        const duration = (Date.now() - startTime) / 1000

        console.log(`[CRON FIN] Éxito: ${successCount}, Fallos: ${failCount}, Tiempo: ${duration}s`)

        return NextResponse.json({
            success: true,
            date: dateString,
            processed: bookings.length,
            successful: successCount,
            failed: failCount,
            duration: `${duration}s`
        })
    } catch (error) {
        console.error('[CRON FATAL ERROR]: ', error)
        return NextResponse.json({ error }, { status: 500 })
    }
}