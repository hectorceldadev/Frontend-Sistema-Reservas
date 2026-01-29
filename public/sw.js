// 1. ESCUCHAR (Cuando llega el mensaje desde el servidor)
self.addEventListener('push', function (event) {
  // Si el usuario no ha dado permiso, no hacemos nada
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  // Leemos los datos que envía tu backend
  const data = event.data?.json() ?? {};
  
  const title = data.title || 'Barbería Estilo';
  const message = data.body || 'Tienes una nueva notificación.';
  const icon = '/icon-192x192.png'; // Asegúrate de que este archivo existe en public
  const url = data.url || '/'; // A dónde ir si hacen clic

  // Configuramos la ventanita visual
  const options = {
    body: message,
    icon: icon,
    badge: icon, // Icono pequeño para la barra de estado de Android
    data: { url: url }, // Guardamos la URL oculta para usarla luego
    vibrate: [100, 50, 100], // Vibración: Bzz-bz-Bzz
    actions: [
      { action: 'open', title: 'Ver' }
    ]
  };

  // Mostramos la notificación y esperamos a que el navegador confirme
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 2. ACTUAR (Cuando el usuario toca la notificación)
self.addEventListener('notificationclick', function (event) {
  event.notification.close(); // Cerramos la ventanita inmediatamente

  // Recuperamos la URL que guardamos en el paso 1
  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // INTELIGENCIA:
      // A. Si la web ya está abierta en una pestaña, solo la enfocamos (no abrimos otra)
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // B. Si no está abierta, abrimos una ventana nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});