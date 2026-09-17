import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { SportIcon } from '../components/SportIcon'
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

  const [searchParams, setSearchParams] = useSearchParams()
  const activeSport = searchParams.get('sport') ?? 'tous'

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

  const sports = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of items) counts.set(p.sport, (counts.get(p.sport) ?? 0) + 1)
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [items])

  const filtered = useMemo(
    () => (activeSport === 'tous' ? items : items.filter((p) => p.sport === activeSport)),
    [items, activeSport],
  )

  function selectSport(sport: string) {
    if (sport === 'tous') setSearchParams({})
    else setSearchParams({ sport })
  }

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
      <main className="px-4 sm:px-6 py-8 sm:py-10 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl mb-6">Pronostics</h1>

        {!loading && items.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-none">
            <button
              onClick={() => selectSport('tous')}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                activeSport === 'tous'
                  ? 'bg-signal border-signal text-white'
                  : 'border-white/15 text-paper/70 hover:border-white/30'
              }`}
            >
              Tous
              <span className="text-xs opacity-70">({items.length})</span>
            </button>
            {sports.map(([sport, count]) => (
              <button
                key={sport}
                onClick={() => selectSport(sport)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  activeSport === sport
                    ? 'bg-signal border-signal text-white'
                    : 'border-white/15 text-paper/70 hover:border-white/30'
                }`}
              >
                <SportIcon sport={sport} className="w-4 h-4" />
                {sport}
                <span className="text-xs opacity-70">({count})</span>
              </button>
            ))}
          </div>
        )}

        {loading && <p className="text-paper/50">Chargement…</p>}
        {!loading && items.length === 0 && (
          <p className="text-paper/50">Aucun pronostic pour le moment.</p>
        )}
        {!loading && items.length > 0 && filtered.length === 0 && (
          <p className="text-paper/50">Aucun pronostic dans cette catégorie.</p>
        )}

        <div className="space-y-4">
          {filtered.map((p) => {
            // Pour un pronostic payant, la ligne "pick" n'arrive du serveur que si l'accès est autorisé (RLS) —
            // ici access_level='paid' + pick absent/masqué signifie "non débloqué".
            const locked = p.access_level === 'paid' && !isVip && !p.pick
            return (
              <div key={p.id} className="border border-white/10 rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-sm text-paper/50">
                    <SportIcon sport={p.sport} className="w-4 h-4" />
                    {p.sport} · {p.competition}
                  </span>
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
