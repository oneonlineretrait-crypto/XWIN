import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { SportIcon } from '../components/SportIcon'
import { supabase } from '../lib/supabase'

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

type MatchTile = {
  match_id: string
  sport: string
  competition: string | null
  match_teams: string
  match_date: string | null
  total: number
  freeCount: number
}

export function Pronostics() {
  const [items, setItems] = useState<PronosticRow[]>([])
  const [loading, setLoading] = useState(true)

  const [searchParams, setSearchParams] = useSearchParams()
  const activeSport = searchParams.get('sport') ?? 'tous'

  useEffect(() => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    supabase
      .from('pronostics_public')
      .select('*')
      .or(`match_date.gte.${startOfToday.toISOString()},match_date.is.null`)
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

  const tiles = useMemo<MatchTile[]>(() => {
    const filtered = activeSport === 'tous' ? items : items.filter((p) => p.sport === activeSport)
    const byMatch = new Map<string, MatchTile>()
    for (const p of filtered) {
      const existing = byMatch.get(p.match_id)
      if (existing) {
        existing.total += 1
        if (p.access_level === 'free') existing.freeCount += 1
      } else {
        byMatch.set(p.match_id, {
          match_id: p.match_id,
          sport: p.sport,
          competition: p.competition,
          match_teams: p.match_teams,
          match_date: p.match_date,
          total: 1,
          freeCount: p.access_level === 'free' ? 1 : 0,
        })
      }
    }
    return Array.from(byMatch.values())
  }, [items, activeSport])

  function selectSport(sport: string) {
    if (sport === 'tous') setSearchParams({})
    else setSearchParams({ sport })
  }

  return (
    <div className="xwin-page-bg min-h-screen">
      <NavBar />
      <main className="px-4 sm:px-6 py-8 sm:py-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl">Pronostics</h1>
          <Link to="/historique" className="text-muted hover:text-paper/80 text-sm">
            Historique →
          </Link>
        </div>

        {!loading && items.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-none">
            <button
              onClick={() => selectSport('tous')}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                activeSport === 'tous'
                  ? 'bg-signal border-signal text-ink'
                  : 'border-white/10 text-paper/70 hover:border-white/30'
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
                    ? 'bg-signal border-signal text-ink'
                    : 'border-white/10 text-paper/70 hover:border-white/30'
                }`}
              >
                <SportIcon sport={sport} className="w-4 h-4" />
                {sport}
                <span className="text-xs opacity-70">({count})</span>
              </button>
            ))}
          </div>
        )}

        {loading && <p className="text-muted">Chargement…</p>}
        {!loading && items.length === 0 && (
          <p className="text-muted">Aucun pronostic pour le moment.</p>
        )}
        {!loading && items.length > 0 && tiles.length === 0 && (
          <p className="text-muted">Aucun pronostic dans cette catégorie.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {tiles.map((t) => (
            <Link
              key={t.match_id}
              to={`/pronostics/${t.match_id}`}
              className="border border-white/[0.07] bg-surface/70 shadow-card rounded-2xl p-4 hover:border-signal/40 hover:bg-white/[0.03] hover:-translate-y-0.5 hover:shadow-glow transition-all flex flex-col"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
                <SportIcon sport={t.sport} className="w-3.5 h-3.5" />
                <span className="truncate">{t.sport}</span>
              </div>

              <p className="font-medium text-sm leading-snug line-clamp-2 flex-1">{t.match_teams}</p>

              {t.match_date && (
                <p className="text-muted/80 text-xs mt-2">
                  {new Date(t.match_date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}

              <div className="flex items-center gap-1.5 mt-3">
                <span className="text-xs bg-white/10 text-paper/70 px-2.5 py-1 rounded-full font-medium">
                  {t.total} prono{t.total > 1 ? 's' : ''}
                </span>
                {t.freeCount > 0 && (
                  <span className="text-xs bg-signal text-ink px-2.5 py-1 rounded-full font-semibold">Gratuit</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
