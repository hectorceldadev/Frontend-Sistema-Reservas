import BookingEmail from "@/components/emails/BookingEmail"
import { render } from "@react-email/render"
import { NextResponse } from "next/server"
import { Resend } from "resend"
import { SITE_CONFIG } from "@/config" // <--- IMPORTAMOS AQUÍ

export async function POST (request: Request) {
    try {
        
        console.log("🔥 ESTOY EJECUTANDO EL CÓDIGO NUEVO - HORA: " + new Date().toISOString())

        const resendApiKey = process.env.RESEND_API_KEY

        if (!resendApiKey) {
            throw new Error('⚠️ Faltan las variables de entorno de RESEND_API_KEY.')
        }

        const resend = new Resend(resendApiKey)

        const body = await request.json()

        // Solo extraemos los datos variables de la reserva
        const { customerName, email, date, time, services, price, staffName } = body

        console.log("📨 Preparando email para:", email)

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const cancelUrl = `${appUrl}/reserva`

        // Usamos SITE_CONFIG directamente aquí. 
        // Esto garantiza que se usan los valores del archivo de configuración.
        const emailHTML = await render(
            BookingEmail({
                customerName,
                date,
                time,
                services, 
                staffName,
                totalPrice: price,
                cancelLink: cancelUrl,
                
                // DATOS FIJOS DEL NEGOCIO (Desde Config)
                businessName: SITE_CONFIG.email.businessName,
                businessAddress: SITE_CONFIG.email.businessAddress,
                logoUrl: SITE_CONFIG.email.logoUrl,
                businessMap: SITE_CONFIG.email.businessMap // Asegúrate que esta clave existe en tu config
            })
        )

        const { data, error } = await resend.emails.send({
            from: 'Celda Barber <onboarding@resend.dev>', //* CAMBIAR CORREO
            to: [email],
            subject: `Confirmación de cita en ${SITE_CONFIG.email.businessName} ✂️`,
            html: emailHTML
        })

        if (error) {
            console.error("❌ Error de Resend:", error)
            return NextResponse.json({ error }, { status: 500 })
        }
        console.log("✅ Email enviado ID:", data?.id)
        return NextResponse.json({ data }, { status: 200 })
    } catch (error) {
        console.error('💥 Error del servidor: ' + error)
        return NextResponse.json({ error }, { status: 500 })
    }
}