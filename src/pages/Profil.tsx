import { useEffect, useState } from 'react'
import { NavBar } from '../components/NavBar'
import { useAuth } from '../lib/AuthContext'
import { useProfile } from '../lib/useProfile'
import { supabase } from '../lib/supabase'

type Purchase = {
  id: string
  item_type: 'pronostic' | 'montante' | 'product' | 'subscription'
  amount: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  created_at: string
}

const itemTypeLabels: Record<Purchase['item_type'], string> = {
  pronostic: 'Pronostic',
  montante: 'Montante',
  product: 'Stratégie / formation',
  subscription: 'Abonnement VIP',
}

const statusLabels: Record<Purchase['payment_status'], string> = {
  paid: 'Payé',
  pending: 'En attente',
  failed: 'Échoué',
  refunded: 'Remboursé',
}

export function Profil() {
  const { session } = useAuth()
  const { profile, refreshProfile } = useProfile()
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loadingPurchases, setLoadingPurchases] = useState(true)
  const [referralStats, setReferralStats] = useState<{ total_referred: number; rewarded: number } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (profile?.display_name) setDisplayName(profile.display_name)
  }, [profile?.display_name])

  useEffect(() => {
    if (!session) return
    supabase
      .from('purchases')
      .select('id, item_type, amount, payment_status, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPurchases((data as Purchase[]) ?? [])
        setLoadingPurchases(false)
      })
  }, [session])

  useEffect(() => {
    if (!session) return
    supabase.rpc('referral_stats').then(({ data }) => {
      if (data && data[0]) setReferralStats(data[0])
    })
  }, [session])

  async function handleSave() {
    if (!session) return
    setSaving(true)
    setSaved(false)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() || null })
      .eq('id', session.user.id)
    setSaving(false)
    if (!error) {
      setSaved(true)
      refreshProfile()
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const isVip = profile?.subscription_status === 'vip'

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="px-6 py-10 max-w-3xl mx-auto space-y-10">
        <h1 className="font-display text-3xl">Mon profil</h1>

        <section className="border border-white/10 rounded-2xl p-5 space-y-4">
          <h2 className="font-medium text-lg">Informations du compte</h2>

          <div>
            <label className="block text-sm text-paper/60 mb-1">Email</label>
            <p className="text-paper/90">{session?.user.email}</p>
          </div>

          <div>
            <label htmlFor="display_name" className="block text-sm text-paper/60 mb-1">
              Pseudo
            </label>
            <div className="flex gap-2">
              <input
                id="display_name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ton pseudo"
                className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-signal"
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-signal text-ink font-semibold px-4 py-2 rounded-full text-sm hover:bg-signal/90 active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? 'Enregistrement…' : saved ? 'Enregistré ✓' : 'Enregistrer'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-paper/60 mb-1">Statut</label>
            {isVip ? (
              <p className="text-gold font-medium">
                VIP — actif jusqu'au{' '}
                {profile?.subscription_expires_at
                  ? new Date(profile.subscription_expires_at).toLocaleDateString('fr-FR')
                  : '—'}
              </p>
            ) : (
              <p className="text-paper/70">
                Compte gratuit —{' '}
                <a href="/abonnement" className="text-signal hover:underline">
                  passer VIP
                </a>
              </p>
            )}
          </div>
        </section>

        <section className="border border-gold/30 rounded-2xl p-5 space-y-3">
          <h2 className="font-medium text-lg">🎁 Parraine tes amis</h2>
          <p className="text-paper/60 text-sm">
            Pour chaque ami qui s'inscrit avec ton lien et fait son premier achat, tu reçois{' '}
            <span className="text-gold font-medium">7 jours de VIP offerts</span>.
          </p>

          {profile?.referral_code && (
            <div className="flex gap-2">
              <input
                readOnly
                value={`${window.location.origin}/auth?tab=signup&ref=${profile.referral_code}`}
                className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs text-paper/70"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/auth?tab=signup&ref=${profile.referral_code}`)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="bg-gold text-ink font-semibold px-4 py-2 rounded-full text-sm hover:bg-gold/90 active:scale-95 transition-all shrink-0"
              >
                {copied ? 'Copié ✓' : 'Copier'}
              </button>
            </div>
          )}

          {referralStats && (
            <p className="text-paper/50 text-xs">
              {referralStats.total_referred} ami{referralStats.total_referred > 1 ? 's' : ''} inscrit
              {referralStats.total_referred > 1 ? 's' : ''} · {referralStats.rewarded} récompense
              {referralStats.rewarded > 1 ? 's' : ''} obtenue{referralStats.rewarded > 1 ? 's' : ''}
            </p>
          )}
        </section>

        <section className="border border-white/10 rounded-2xl p-5">
          <h2 className="font-medium text-lg mb-4">Historique des achats</h2>

          {loadingPurchases ? (
            <p className="text-paper/50 text-sm">Chargement…</p>
          ) : purchases.length === 0 ? (
            <p className="text-paper/50 text-sm">Aucun achat pour le moment.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {purchases.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="text-paper/90">{itemTypeLabels[p.item_type]}</p>
                    <p className="text-paper/50 text-xs">
                      {new Date(p.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-paper/90">{p.amount.toLocaleString('fr-FR')} FCFA</p>
                    <p
                      className={
                        p.payment_status === 'paid'
                          ? 'text-green-400 text-xs'
                          : p.payment_status === 'failed'
                            ? 'text-red-400 text-xs'
                            : 'text-paper/50 text-xs'
                      }
                    >
                      {statusLabels[p.payment_status]}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
