import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { SportIcon } from '../components/SportIcon'
import { supabase } from '../lib/supabase'
import { startCheckout } from '../lib/checkout'
import { useProfile } from '../lib/useProfile'

type PronosticRow = {
  id: string
  match_id: string
  sport: string
  competition: string | null
  match_teams: string
  match_date: string | null
  access_level: 'free' | 'paid'
  price: number | null
  status: 'pending' | 'won' | 'lost' | 'void'
  pick: string | null
  odds: number | null
  analysis: string | null
}

type MatchGroup = {
  match_id: string
  sport: string
  competition: string | null
  match_teams: string
  match_date: string | null
  pronostics: PronosticRow[]
}

export function Pronostics() {
  const [items, setItems] = useState<PronosticRow[]>([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [expandedMatches, setExpandedMatches] = useState<Set<string>>(new Set())
  const { profile } = useProfile()
  const isVip = profile?.subscription_status === 'vip'

  const VISIBLE_LIMIT = 4

  function toggleExpanded(matchId: string) {
    setExpandedMatches((prev) => {
      const next = new Set(prev)
      if (next.has(matchId)) next.delete(matchId)
      else next.add(matchId)
      return next
    })
  }

  const [searchParams, setSearchParams] = useSearchParams()
  const activeSport = searchParams.get('sport') ?? 'tous'

  useEffect(() => {
    supabase
      .from('pronostics_public')
      .select('*')
      .order('match_date', { ascending: true })
      .then(({ data }) => {
        setItems((data as PronosticRow[]) ?? [])
        setLoading(false)
      })
  }, [])

  const sports = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of items) counts.set(p.sport, (counts.get(p.sport) ?? 0) + 1)
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [items])

  const matches = useMemo<MatchGroup[]>(() => {
    const filtered = activeSport === 'tous' ? items : items.filter((p) => p.sport === activeSport)
    const byMatch = new Map<string, MatchGroup>()
    for (const p of filtered) {
      const existing = byMatch.get(p.match_id)
      if (existing) {
        existing.pronostics.push(p)
      } else {
        byMatch.set(p.match_id, {
          match_id: p.match_id,
          sport: p.sport,
          competition: p.competition,
          match_teams: p.match_teams,
          match_date: p.match_date,
          pronostics: [p],
        })
      }
    }
    return Array.from(byMatch.values())
  }, [items, activeSport])

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
        {!loading && items.length > 0 && matches.length === 0 && (
          <p className="text-paper/50">Aucun pronostic dans cette catégorie.</p>
        )}

        <div className="space-y-5">
          {matches.map((m) => (
            <div key={m.match_id} className="border border-white/10 rounded-lg overflow-hidden">
              <div className="px-5 py-4 bg-white/[0.03] border-b border-white/10">
                <div className="flex items-center gap-1.5 text-sm text-paper/50 mb-1">
                  <SportIcon sport={m.sport} className="w-4 h-4" />
                  {m.sport} {m.competition && `· ${m.competition}`}
                </div>
                <p className="font-medium">{m.match_teams}</p>
                {m.match_date && (
                  <p className="text-paper/40 text-xs mt-0.5">
                    {new Date(m.match_date).toLocaleString('fr-FR', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>

              <div className="divide-y divide-white/5">
                {(expandedMatches.has(m.match_id) ? m.pronostics : m.pronostics.slice(0, VISIBLE_LIMIT)).map((p) => {
                  // Pour un pronostic payant, la ligne "pick" n'arrive du serveur que si l'accès est autorisé (RLS) —
                  // ici access_level='paid' + pick absent/masqué signifie "non débloqué".
                  const locked = p.access_level === 'paid' && !isVip && !p.pick
                  return (
                    <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                      {locked ? (
                        <>
                          <span className="text-sm text-paper/50">Pronostic verrouillé</span>
                          <button
                            onClick={() => handleUnlock(p.id)}
                            disabled={payingId === p.id}
                            className="shrink-0 bg-signal text-white px-3 py-1.5 rounded-md text-xs hover:bg-signal/90 disabled:opacity-50"
                          >
                            {payingId === p.id ? 'Redirection…' : `Débloquer — ${p.price} FCFA`}
                          </button>
                        </>
                      ) : (
                        <div className="flex-1">
                          <p className="text-sm text-paper/80">
                            {p.pick} {p.odds && <span className="text-paper/50">(cote {p.odds})</span>}
                          </p>
                          {p.analysis && (
                            <p className="text-xs text-paper/50 mt-1 leading-relaxed">{p.analysis}</p>
                          )}
                        </div>
                      )}
                      {p.access_level === 'paid' && !locked && (
                        <span className="shrink-0 text-xs bg-signal/20 text-signal px-2 py-0.5 rounded">VIP</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {m.pronostics.length > VISIBLE_LIMIT && (
                <button
                  onClick={() => toggleExpanded(m.match_id)}
                  className="w-full text-center text-sm text-signal py-3 border-t border-white/5 hover:bg-white/[0.03]"
                >
                  {expandedMatches.has(m.match_id)
                    ? 'Réduire'
                    : `Voir les ${m.pronostics.length} pronostics`}
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
