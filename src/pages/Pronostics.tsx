import { useEffect, useState } from 'react'
import { NavBar } from '../components/NavBar'
import { supabase } from '../lib/supabase'
import { startCheckout } from '../lib/checkout'
import { useProfile } from '../lib/useProfile'

type Pronostic = {
  id: string
  sport: string
  competition: string | null
  match_teams: string
  match_date: string | null
  pick: string
  odds: number | null
  access_level: 'free' | 'paid'
  price: number | null
  status: 'pending' | 'won' | 'lost' | 'void'
}

export function Pronostics() {
  const [items, setItems] = useState<Pronostic[]>([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState<string | null>(null)
  const { profile } = useProfile()
  const isVip = profile?.subscription_status === 'vip'

  useEffect(() => {
    supabase
      .from('pronostics_public')
      .select('*')
      .order('match_date', { ascending: true })
      .then(({ data }) => {
        setItems((data as Pronostic[]) ?? [])
        setLoading(false)
      })
  }, [])

  async function handleUnlock(id: string) {
    setPayingId(id)
    try {
      await startCheckout({ item_type: 'pronostic', item_id: id })
    } catch (e) {
      alert((e as Error).message)
      setPayingId(null)
    }
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="px-6 py-10 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl mb-8">Pronostics</h1>

        {loading && <p className="text-paper/50">Chargement…</p>}
        {!loading && items.length === 0 && (
          <p className="text-paper/50">Aucun pronostic pour le moment.</p>
        )}

        <div className="space-y-4">
          {items.map((p) => {
            // Pour un pronostic payant, la ligne "pick" n'arrive du serveur que si l'accès est autorisé (RLS) —
            // ici access_level='paid' + pick absent/masqué signifie "non débloqué".
            const locked = p.access_level === 'paid' && !isVip && !p.pick
            return (
              <div key={p.id} className="border border-white/10 rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-paper/50">{p.sport} · {p.competition}</span>
                  {p.access_level === 'paid' && (
                    <span className="text-xs bg-signal/20 text-signal px-2 py-0.5 rounded">VIP</span>
                  )}
                </div>
                <p className="font-medium mb-1">{p.match_teams}</p>
                {locked ? (
                  <button
                    onClick={() => handleUnlock(p.id)}
                    disabled={payingId === p.id}
                    className="mt-2 bg-signal text-white px-4 py-2 rounded-md text-sm hover:bg-signal/90 disabled:opacity-50"
                  >
                    {payingId === p.id ? 'Redirection…' : `Débloquer — ${p.price} FCFA`}
                  </button>
                ) : (
                  <p className="text-paper/70">
                    {p.pick} {p.odds && <span className="text-paper/50">(cote {p.odds})</span>}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
