// Ne renvoie une URL (signée, 5 minutes) que si l'utilisateur a réellement acheté ce produit, ou est admin.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

  const body = await req.json().catch(() => ({}))
  const productId = body.productId as string | undefined
  if (!productId) return json({ error: 'productId requis' }, 400)

  const { data: product } = await admin
    .from('products')
    .select('content_path, content_type')
    .eq('id', productId)
    .maybeSingle()

  if (!product?.content_path) return json({ error: 'Aucun fichier associé à ce produit' }, 404)

  const { data: profile } = await admin.from('profiles').select('role').eq('id', u.user.id).maybeSingle()
  const isAdmin = profile?.role === 'admin'

  let entitled = isAdmin
  if (!entitled) {
    const { data: purchase } = await admin
      .from('purchases')
      .select('id')
      .eq('user_id', u.user.id)
      .eq('item_type', 'product')
      .eq('item_id', productId)
      .eq('payment_status', 'completed')
      .maybeSingle()
    entitled = !!purchase
  }
  if (!entitled) return json({ error: 'Ce contenu doit être acheté.' }, 403)

  const { data: signed, error: signErr } = await admin.storage
    .from('product-content')
    .createSignedUrl(product.content_path, 300)
  if (signErr || !signed) return json({ error: signErr?.message ?? 'Impossible de générer le lien' }, 500)

  return json({ url: signed.signedUrl, content_type: product.content_type })
})
