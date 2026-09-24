import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from './supabase'

const VAPID_PUBLIC_KEY = 'BCKtNv4iQDzvy1y8J5Kdxh0jO12BDChw2xgumZU2I0ys0WDGv9XQCE8ESY8lPElj3Kn1aG6qdUVT9qDQLSWU7A4'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export function usePushNotifications() {
  const { session } = useAuth()
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window)
  }, [])

  useEffect(() => {
    if (!supported || !session) return
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      setSubscribed(!!sub)
    })
  }, [supported, session])

  async function subscribe() {
    if (!session) return
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setLoading(false)
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      const json = sub.toJSON()
      await supabase.from('push_subscriptions').upsert(
        {
          user_id: session.user.id,
          endpoint: json.endpoint!,
          p256dh: json.keys!.p256dh,
          auth_key: json.keys!.auth,
        },
        { onConflict: 'endpoint' },
      )
      setSubscribed(true)
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        await sub.unsubscribe()
      }
      setSubscribed(false)
    } finally {
      setLoading(false)
    }
  }

  return { supported, subscribed, loading, subscribe, unsubscribe }
}
