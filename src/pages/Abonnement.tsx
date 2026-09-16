import { useState } from 'react'
import { NavBar } from '../components/NavBar'
import { startCheckout } from '../lib/checkout'
import { useProfile } from '../lib/useProfile'

const plans = [
  { id: 'weekly' as const, label: 'Hebdomadaire', price: 5999 },
  { id: 'monthly' as const, label: 'Mensuel', price: 15999 },
]

export function Abonnement() {
  const { profile } = useProfile()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  async function handleSubscribe(plan: 'weekly' | 'monthly') {
    setLoadingPlan(plan)
    try {
      await startCheckout({ item_type: 'subscription', plan })
    } catch (e) {
      alert((e as Error).message)
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="px-6 py-10 max-w-2xl mx-auto">
        <h1 className="font-display text-3xl mb-2">Abonnement VIP</h1>
        <p className="text-paper/60 mb-8">Accès illimité à tous les pronostics, montantes et contenus payants.</p>

        {profile?.subscription_status === 'vip' && (
          <div className="mb-8 border border-signal/40 bg-signal/10 rounded-lg p-4 text-sm">
            Tu es déjà VIP
            {profile.subscription_expires_at &&
              ` jusqu'au ${new Date(profile.subscription_expires_at).toLocaleDateString('fr-FR')}`}
            .
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="border border-white/10 rounded-lg p-6 text-center">
              <h2 className="font-display text-xl mb-2">{plan.label}</h2>
              <p className="text-3xl font-medium mb-6">{plan.price} FCFA</p>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loadingPlan === plan.id}
                className="w-full bg-signal text-white px-4 py-3 rounded-md hover:bg-signal/90 disabled:opacity-50"
              >
                {loadingPlan === plan.id ? 'Redirection…' : "S'abonner"}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
