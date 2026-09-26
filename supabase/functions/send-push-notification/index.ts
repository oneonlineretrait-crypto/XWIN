// Envoie une notification push à tous les abonnés (appelé depuis l'admin).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.7'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405)

  const url = Deno.env.get('SUPABASE_URL')!
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
  const { data: u, error: authErr } = await admin.auth.getUser(token)
  if (authErr || !u.user) return json({ error: 'Non connecté' }, 401)

  const { data: profile } = await admin.from('profiles').select('role').eq('id', u.user.id).maybeSingle()
  if (profile?.role !== 'admin') return json({ error: 'Réservé aux administrateurs' }, 403)

  const body = await req.json().catch(() => ({}))
  const title = body.title as string | undefined
  const message = body.body as string | undefined
  const targetUrl = (body.url as string | undefined) ?? '/pronostics'
  if (!title || !message) return json({ error: 'Titre et message requis' }, 400)

  const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY')
  const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY')
  if (!vapidPublic || !vapidPrivate) {
    return json({ error: 'Clés VAPID absentes des secrets Supabase' }, 500)
  }
  webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT') ?? 'mailto:contact@xwin.app', vapidPublic, vapidPrivate)

  const { data: subs, error: subsErr } = await admin.from('push_subscriptions').select('*')
  if (subsErr) return json({ error: subsErr.message }, 500)

  let sent = 0
  let failed = 0
  const payload = JSON.stringify({ title, body: message, url: targetUrl })

  await Promise.all(
    (subs ?? []).map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } }, payload)
        sent++
      } catch (err) {
        failed++
        const statusCode = (err as { statusCode?: number })?.statusCode
        if (statusCode === 404 || statusCode === 410) {
          await admin.from('push_subscriptions').delete().eq('id', s.id)
        }
      }
    }),
  )

  return json({ sent, failed, total: (subs ?? []).length })
})
