/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare let self: ServiceWorkerGlobalScope

// Precache genere automatiquement par vite-plugin-pwa (strategie injectManifest)
precacheAndRoute(self.__WB_MANIFEST)

// Meme strategie de cache API qu'avant (network-first, fallback cache)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'xwin-api-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 300 })],
  }),
)

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Reception d'une notification push envoyee depuis le serveur
self.addEventListener('push', (event) => {
  if (!event.data) return
  let payload: { title?: string; body?: string; url?: string } = {}
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'XWIN', body: event.data.text() }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'XWIN', {
      body: payload.body ?? '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: payload.url ?? '/pronostics' },
    }),
  )
})

// Clic sur la notification : ouvre/focus l'app sur la bonne page
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = (event.notification.data as { url?: string })?.url ?? '/pronostics'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => 'focus' in c)
      if (existing) {
        existing.focus()
        if ('navigate' in existing) (existing as WindowClient).navigate(targetUrl)
        return
      }
      self.clients.openWindow(targetUrl)
    }),
  )
})
