// Liste les comptes (id + email) pour le formulaire de création de licence côté admin.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const url = Deno.env.get('SUPABASE_URL')!
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
  const { data: u, error: authErr } = await admin.auth.getUser(token)
  if (authErr || !u.user) return json({ error: 'Non connecté' }, 401)

  const { data: profile } = await admin.from('profiles').select('role').eq('id', u.user.id).maybeSingle()
  if (profile?.role !== 'admin') return json({ error: 'Réservé aux administrateurs' }, 403)

  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (error) return json({ error: error.message }, 500)

  const ids = data.users.map((usr) => usr.id)
  const { data: profiles } = await admin.from('profiles').select('id, public_id').in('id', ids)
  const publicIdById = new Map((profiles ?? []).map((p) => [p.id, p.public_id as string]))

  return json({
    users: data.users.map((usr) => ({
      id: usr.id,
      email: usr.email,
      public_id: publicIdById.get(usr.id) ?? null,
    })),
  })
})
