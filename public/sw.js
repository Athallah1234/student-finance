self.addEventListener('push', function(event) {
  let data = { title: 'Notifikasi Baru', body: 'Klik untuk melihat detail.', url: '/dashboard' };
  
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.warn('Push event with invalid JSON data', e);
  }

  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard'
    },
    actions: [
      { action: 'view', title: 'Lihat Detail' },
      { action: 'close', title: 'Tutup' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
