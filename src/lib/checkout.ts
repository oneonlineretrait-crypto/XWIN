import { supabase } from './supabase'

type CheckoutPayload =
  | { item_type: 'pronostic' | 'montante' | 'product'; item_id: string }
  | { item_type: 'subscription'; plan: 'weekly' | 'monthly' }

// Appelle l'Edge Function create-checkout-session et redirige vers Stripe Checkout
export async function startCheckout(payload: CheckoutPayload) {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) throw new Error('Non connecté')

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  )

  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erreur de paiement')
  window.location.href = data.url
}
