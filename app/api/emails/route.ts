import BookingEmail from "@/components/emails/BookingEmail"
import { render } from "@react-email/render"
import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST (request: Request) {
    try {
        const body = await request.json()

        const { customerName, email, date, time, services, price, staffName, bookingId } = body

        console.log("📨 Preparando email para:", email)

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http:localhost:3000'
        const cancelUrl = `${appUrl}/cancelar?id=${bookingId}`

        const emailHTML = await render(
            BookingEmail({
                customerName,
                date,
                time,
                services, 
                staffName,
                totalPrice: price,
                cancelLink: cancelUrl
            })
        )

        const { data, error } = await resend.emails.send({
            from: 'Celda Barber <onboarding@resend.dev>',
            to: [email],
            subject: 'Confirmación de cita ✂️',
            html: emailHTML
        })

        if (error) {
            console.error("❌ Error de Resend:", error)
            return NextResponse.json({ error }, { status: 500 })
        }
        console.log('✅ Email enviado ID:", data?.id')
        return NextResponse.json({ data }, { status: 200 })
    } catch (error) {
        console.error('💥 Error del servidor: ' + error)
        return NextResponse.json({ error }, { status: 500 })
    }
}