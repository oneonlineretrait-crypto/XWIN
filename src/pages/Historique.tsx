import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
  status: 'pending' | 'won' | 'lost' | 'void'
}

type MatchTile = {
  match_id: string
  sport: string
  competition: string | null
  match_teams: string
  match_date: string | null
  won: number
  lost: number
  total: number
}

export function Historique() {
  const [items, setItems] = useState<PronosticRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    supabase
      .from('pronostics_public')
      .select('id, match_id, sport, competition, match_teams, match_date, status')
      .lt('match_date', startOfToday.toISOString())
      .order('match_date', { ascending: false })
      .then(({ data }) => {
        setItems((data as PronosticRow[]) ?? [])
        setLoading(false)
      })
  }, [])

  const record = useMemo(() => {
    const won = items.filter((p) => p.status === 'won').length
    const lost = items.filter((p) => p.status === 'lost').length
    const total = won + lost
    return { won, lost, rate: total > 0 ? Math.round((won / total) * 100) : null }
  }, [items])

  const matches = useMemo<MatchTile[]>(() => {
    const byMatch = new Map<string, MatchTile>()
    for (const p of items) {
      const existing = byMatch.get(p.match_id)
      if (existing) {
        existing.total += 1
        if (p.status === 'won') existing.won += 1
        if (p.status === 'lost') existing.lost += 1
      } else {
        byMatch.set(p.match_id, {
          match_id: p.match_id,
          sport: p.sport,
          competition: p.competition,
          match_teams: p.match_teams,
          match_date: p.match_date,
          total: 1,
          won: p.status === 'won' ? 1 : 0,
          lost: p.status === 'lost' ? 1 : 0,
        })
      }
    }
    return Array.from(byMatch.values())
  }, [items])

  return (
    <div className="xwin-page-bg min-h-screen">
      <NavBar />
      <main className="px-4 sm:px-6 py-8 sm:py-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-display text-3xl">Historique</h1>
          <Link to="/pronostics" className="text-muted hover:text-paper/80 text-sm">
            ← Pronostics du jour
          </Link>
        </div>

        {!loading && record.rate !== null && (
          <p className="text-muted text-sm mb-6">
            Palmarès : <span className="text-signal font-medium">{record.won} gagnés</span> ·{' '}
            <span className="text-alert font-medium">{record.lost} perdus</span> ·{' '}
            <span className="text-gold font-medium">{record.rate}% de réussite</span>
          </p>
        )}

        {loading && <p className="text-muted">Chargement…</p>}
        {!loading && matches.length === 0 && (
          <p className="text-muted">Aucun pronostic archivé pour le moment.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {matches.map((t) => (
            <Link
              key={t.match_id}
              to={`/pronostics/${t.match_id}`}
              className="border border-white/[0.07] bg-surface/70 shadow-card rounded-2xl p-4 hover:border-white/25 hover:bg-white/[0.03] transition-colors flex flex-col"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
                <SportIcon sport={t.sport} className="w-3.5 h-3.5" />
                <span className="truncate">{t.sport}</span>
              </div>

              <p className="font-medium text-sm leading-snug line-clamp-2 flex-1">{t.match_teams}</p>

              {t.match_date && (
                <p className="text-muted/80 text-xs mt-2">
                  {new Date(t.match_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              )}

              <div className="flex items-center gap-1.5 mt-3">
                {t.won > 0 && (
                  <span className="text-xs bg-signal text-ink font-semibold px-2.5 py-1 rounded-full">{t.won} gagné{t.won > 1 ? 's' : ''}</span>
                )}
                {t.lost > 0 && (
                  <span className="text-xs bg-alert/20 text-alert font-semibold px-2.5 py-1 rounded-full">{t.lost} perdu{t.lost > 1 ? 's' : ''}</span>
                )}
                {t.won === 0 && t.lost === 0 && (
                  <span className="text-xs bg-white/10 text-muted px-2.5 py-1 rounded-full">{t.total} prono{t.total > 1 ? 's' : ''}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
