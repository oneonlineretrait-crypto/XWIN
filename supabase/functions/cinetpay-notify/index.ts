// Notification CinetPay (serveur à serveur) + retour du client après paiement.
// Le statut est toujours revérifié auprès de CinetPay : la notification seule ne fait pas foi.
// Déployer avec : supabase functions deploy cinetpay-notify --no-verify-jwt
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DAYS = { weekly: 7, monthly: 30 } as const

async function checkAndApply(transactionId: string): Promise<'paid' | 'failed' | 'pending'> {
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: purchase } = await admin.from('purchases').select('*').eq('transaction_id', transactionId).maybeSingle()
  if (!purchase) return 'failed'
  if (purchase.payment_status === 'paid') return 'paid'

  const res = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apikey: Deno.env.get('CINETPAY_API_KEY'),
      site_id: Deno.env.get('CINETPAY_SITE_ID'),
      transaction_id: transactionId,
    }),
  })
  const cp = await res.json().catch(() => ({}))
  const status = cp.data?.status

  if (status === 'ACCEPTED' && Number(cp.data.amount) >= Number(purchase.amount)) {
    const { data: updated } = await admin
      .from('purchases')
      .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', purchase.id)
      .neq('payment_status', 'paid')
      .select('id')
    if (updated?.length && purchase.item_type === 'subscription') {
      const { data: prof } = await admin
        .from('profiles').select('subscription_expires_at').eq('id', purchase.user_id).maybeSingle()
      const base = Math.max(Date.now(), prof?.subscription_expires_at ? Date.parse(prof.subscription_expires_at) : 0)
      const days = DAYS[purchase.plan as keyof typeof DAYS] ?? 30
      await admin.from('profiles').update({
        subscription_status: 'vip',
        subscription_expires_at: new Date(base + days * 86400000).toISOString(),
      }).eq('id', purchase.user_id)
    }
    return 'paid'
  }
  if (status === 'REFUSED' || status === 'CANCELED') {
    await admin.from('purchases').update({ payment_status: 'failed' }).eq('id', purchase.id).eq('payment_status', 'pending')
    return 'failed'
  }
  return 'pending'
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const isReturn = url.searchParams.has('return')
  let tx = url.searchParams.get('tx') ?? ''
  if (req.method === 'POST' && !tx) {
    const form = await req.formData().catch(() => null)
    tx = String(form?.get('cpm_trans_id') ?? form?.get('transaction_id') ?? '')
  }
  if (req.method === 'GET' && !isReturn) return new Response('ok') // test de disponibilité CinetPay

  const result = tx ? await checkAndApply(tx) : 'failed'

  if (isReturn) {
    const site = Deno.env.get('SITE_URL') ?? ''
    return Response.redirect(`${site}${result === 'failed' ? '/paiement/annule' : '/paiement/succes'}`, 303)
  }
  return new Response('ok')
})
