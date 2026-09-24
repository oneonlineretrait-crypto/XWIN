// Crée un achat "pending" puis initialise un paiement CinetPay et renvoie l'URL du guichet.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const PLANS = { weekly: 5999, monthly: 15999 } as const
const TABLES = { pronostic: 'pronostics', montante: 'montantes', product: 'products' } as const
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
  const user = u.user

  const body = await req.json().catch(() => ({}))
  let amount: number
  let description: string
  let itemId: string | null = null
  let plan: string | null = null
  if (body.item_type === 'subscription') {
    if (!(body.plan in PLANS)) return json({ error: 'Formule invalide' }, 400)
    plan = body.plan
    amount = PLANS[body.plan as keyof typeof PLANS]
    description = `XWIN VIP ${plan === 'weekly' ? 'hebdomadaire' : 'mensuel'}`
  } else if (body.item_type in TABLES && typeof body.item_id === 'string') {
    const { data: item } = await admin
      .from(TABLES[body.item_type as keyof typeof TABLES])
      .select('id, price')
      .eq('id', body.item_id)
      .maybeSingle()
    if (!item?.price) return json({ error: 'Contenu introuvable' }, 404)
    itemId = item.id
    amount = Number(item.price)
    description = `XWIN ${body.item_type}`
  } else return json({ error: 'Requête invalide' }, 400)

  amount = Math.ceil(amount / 5) * 5 // CinetPay exige un multiple de 5 en XOF
  const transactionId = `XW${Date.now()}${crypto.randomUUID().slice(0, 8)}`.toUpperCase()

  const { error: insErr } = await admin.from('purchases').insert({
    user_id: user.id, item_type: body.item_type, item_id: itemId, plan, amount,
    payment_status: 'pending', provider: 'cinetpay', transaction_id: transactionId,
  })
  if (insErr) return json({ error: "Impossible d'enregistrer l'achat" }, 500)

  const notifyUrl = `${url}/functions/v1/cinetpay-notify`
  const res = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey: Deno.env.get('CINETPAY_API_KEY'),
      site_id: Deno.env.get('CINETPAY_SITE_ID'),
      transaction_id: transactionId,
      amount, currency: 'XOF', description,
      notify_url: notifyUrl,
      return_url: `${notifyUrl}?return=1&tx=${transactionId}`,
      channels: 'ALL', lang: 'fr',
      customer_id: user.id, customer_email: user.email,
    }),
  })
  const cp = await res.json().catch(() => ({}))
  if (cp.code !== '201' || !cp.data?.payment_url) {
    await admin.from('purchases').update({ payment_status: 'failed' }).eq('transaction_id', transactionId)
    return json({ error: 'Le service de paiement est momentanément indisponible' }, 502)
  }
  return json({ url: cp.data.payment_url })
})
