import { useEffect, useState, type FormEvent } from 'react'
import { NavBar } from '../components/NavBar'
import { useAuth } from '../lib/AuthContext'
import { useProfile } from '../lib/useProfile'
import { supabase } from '../lib/supabase'
import { usePushNotifications } from '../lib/usePushNotifications'

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
  const push = usePushNotifications()
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loadingPurchases, setLoadingPurchases] = useState(true)
  const [referralStats, setReferralStats] = useState<{ total_referred: number; rewarded: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const [licenseCode, setLicenseCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [licenseMessage, setLicenseMessage] = useState<{ text: string; ok: boolean } | null>(null)

  async function handleRedeemLicense(e: FormEvent) {
    e.preventDefault()
    setRedeeming(true)
    setLicenseMessage(null)
    const { data, error } = await supabase.rpc('redeem_license', { p_code: licenseCode.trim() })
    setRedeeming(false)
    if (error) {
      setLicenseMessage({ text: error.message, ok: false })
      return
    }
    if (data === 'ok') {
      setLicenseMessage({ text: 'Licence activée — bienvenue chez les VIP !', ok: true })
      setLicenseCode('')
      refreshProfile()
    } else {
      setLicenseMessage({ text: data as string, ok: false })
    }
  }

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
    <div className="xwin-page-bg min-h-screen">
      <NavBar />
      <main className="px-6 py-10 max-w-3xl mx-auto space-y-10">
        <h1 className="font-display text-3xl">Mon profil</h1>

        <section className="border border-white/[0.07] bg-surface/70 shadow-card rounded-2xl p-5 space-y-4">
          <h2 className="font-medium text-lg">Informations du compte</h2>

          <div>
            <label className="block text-sm text-muted mb-1">Email</label>
            <p className="text-paper/90">{session?.user.email}</p>
          </div>

          <div>
            <label htmlFor="display_name" className="block text-sm text-muted mb-1">
              Pseudo
            </label>
            <div className="flex gap-2">
              <input
                id="display_name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ton pseudo"
                className="flex-1 bg-white/5 border border-white/[0.07] rounded-2xl px-3 py-2 text-sm focus:outline-none focus:border-signal"
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
            <label className="block text-sm text-muted mb-1">Identifiant du compte</label>
            <p className="text-paper/90 font-mono tracking-wider">{profile?.public_id ?? '—'}</p>
            <p className="text-xs text-muted/70 mt-0.5">Donne cet identifiant pour qu'on te génère une licence.</p>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Statut</label>
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

        <section className="border border-white/[0.07] bg-surface/70 shadow-card rounded-2xl p-5 space-y-2">
          <h2 className="font-medium text-lg">🔔 Notifications</h2>
          {!push.supported ? (
            <p className="text-muted text-sm">Non disponible sur ce navigateur/appareil.</p>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-muted text-sm">
                {push.subscribed ? 'Activées — tu reçois les nouveaux pronos.' : 'Sois prévenu dès qu\'un nouveau prono tombe.'}
              </p>
              <button
                onClick={push.subscribed ? push.unsubscribe : push.subscribe}
                disabled={push.loading}
                className={`shrink-0 ml-3 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 ${
                  push.subscribed ? 'border border-white/20 text-muted hover:bg-white/5' : 'bg-signal text-ink hover:bg-signal/90'
                }`}
              >
                {push.loading ? '…' : push.subscribed ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          )}
        </section>

        <section className="border border-gold/30 bg-surface/70 shadow-card rounded-2xl p-5 space-y-3">
          <h2 className="font-medium text-lg">🔑 Activer une licence</h2>
          <p className="text-muted text-sm">Tu as reçu un code après un achat manuel ? Active-le ici.</p>
          <form onSubmit={handleRedeemLicense} className="flex gap-2">
            <input
              required
              placeholder="Code de licence"
              value={licenseCode}
              onChange={(e) => setLicenseCode(e.target.value.toUpperCase())}
              className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm tracking-wider font-mono focus:outline-none focus:border-gold"
            />
            <button
              disabled={redeeming}
              className="bg-gold text-ink font-semibold px-4 py-2 rounded-full text-sm hover:bg-gold/90 active:scale-95 transition-all shrink-0 disabled:opacity-50"
            >
              {redeeming ? '…' : 'Activer'}
            </button>
          </form>
          {licenseMessage && (
            <p className={`text-sm ${licenseMessage.ok ? 'text-signal' : 'text-alert'}`}>{licenseMessage.text}</p>
          )}
        </section>

        <section className="border border-gold/30 bg-surface/70 shadow-card rounded-2xl p-5 space-y-3">
          <h2 className="font-medium text-lg">🎁 Parraine tes amis</h2>
          <p className="text-muted text-sm">
            Pour chaque ami qui s'inscrit avec ton lien et fait son premier achat, tu reçois{' '}
            <span className="text-gold font-medium">7 jours de VIP offerts</span>.
          </p>

          {profile?.referral_code && (
            <div className="flex gap-2">
              <input
                readOnly
                value={`${window.location.origin}/auth?tab=signup&ref=${profile.referral_code}`}
                className="flex-1 bg-white/5 border border-white/[0.07] rounded-2xl px-3 py-2 text-xs text-muted"
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
            <p className="text-muted text-xs">
              {referralStats.total_referred} ami{referralStats.total_referred > 1 ? 's' : ''} inscrit
              {referralStats.total_referred > 1 ? 's' : ''} · {referralStats.rewarded} récompense
              {referralStats.rewarded > 1 ? 's' : ''} obtenue{referralStats.rewarded > 1 ? 's' : ''}
            </p>
          )}
        </section>

        <section className="border border-white/[0.07] bg-surface/70 shadow-card rounded-2xl p-5">
          <h2 className="font-medium text-lg mb-4">Historique des achats</h2>

          {loadingPurchases ? (
            <p className="text-muted text-sm">Chargement…</p>
          ) : purchases.length === 0 ? (
            <p className="text-muted text-sm">Aucun achat pour le moment.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {purchases.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="text-paper/90">{itemTypeLabels[p.item_type]}</p>
                    <p className="text-muted text-xs">
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
                          ? 'text-signal text-xs'
                          : p.payment_status === 'failed'
                            ? 'text-alert text-xs'
                            : 'text-muted text-xs'
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
