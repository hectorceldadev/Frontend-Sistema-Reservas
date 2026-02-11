import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

export async function POST (request: Request) {
    try {

        const vapidSubject = process.env.VAPID_SUBJECT
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

        if (!vapidSubject || !vapidPublicKey || !vapidPrivateKey) {
            throw new Error('Faltan las variables de entorno de web push')
        }

        webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error("⚠️ Faltan las variables de entorno de Supabase.");
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        const { email, title, message, url } = await request.json()

        console.log(`📨 Enviando Push a: ${email}`)

        const { data: subscriptions } = await supabaseAdmin
            .from('push_subscriptions')
            .select('subscription')
            .eq('user_email', email)

        if (!subscriptions || subscriptions.length === 0) {
            console.log('📭 El usuario no tiene dispositivos suscritos.')
            return NextResponse.json({ sent: false, reason: 'no_subscriptions' })
        }

        const payload = JSON.stringify({
            title: title || 'Notification',
            body: message,
            url: url || '/'
        })

        const results = await Promise.allSettled(
            subscriptions.map(sub => 
                webpush.sendNotification(sub.subscription, payload)
                    .catch(err => {
                        if (err.statusCode === 410) {
                            console.log('🗑️ Suscripción caducada detectada (410).')
                        }
                        throw err
                    })
            )
        )

        const succesful = results.filter(r => r.status === 'fulfilled').length
        console.log(`✅ Enviado a ${succesful} de ${subscriptions.length} dispositivos.`)

        return NextResponse.json({ success: true, sent_count: succesful })
    } catch (error: any) {
        console.error('💥 Error enviando notificación:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}