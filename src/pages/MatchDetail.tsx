import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { SportIcon } from '../components/SportIcon'
import { supabase } from '../lib/supabase'
import { startCheckout } from '../lib/checkout'

type PronosticRow = {
  id: string
  match_id: string
  sport: string
  competition: string | null
  match_teams: string
  match_date: string | null
  access_level: 'free' | 'paid' | 'premium'
  price: number | null
  status: 'pending' | 'won' | 'lost' | 'void'
  pick: string | null
  odds: number | null
  analysis: string | null
}

export function MatchDetail() {
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()
  const [items, setItems] = useState<PronosticRow[]>([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState<string | null>(null)

  useEffect(() => {
    if (!matchId) return
    supabase
      .from('pronostics_public')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setItems((data as PronosticRow[]) ?? [])
        setLoading(false)
      })
  }, [matchId])

  async function handleUnlock(id: string) {
    setPayingId(id)
    try {
      await startCheckout({ item_type: 'pronostic', item_id: id })
    } catch {
      navigate('/paiement-indisponible')
    }
  }

  const match = items[0]

  return (
    <div className="xwin-page-bg min-h-screen">
      <NavBar />
      <main className="px-4 sm:px-6 py-8 sm:py-10 max-w-3xl mx-auto">
        <Link to="/pronostics" className="text-sm text-muted hover:text-paper/80 mb-6 inline-block">
          ← Tous les pronostics
        </Link>

        {loading && <p className="text-muted">Chargement…</p>}
        {!loading && !match && <p className="text-muted">Match introuvable.</p>}

        {match && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-sm text-muted mb-1">
                <SportIcon sport={match.sport} className="w-4 h-4" />
                {match.sport} {match.competition && `· ${match.competition}`}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl">{match.match_teams}</h1>
              {match.match_date && (
                <p className="text-muted/80 text-sm mt-1">
                  {new Date(match.match_date).toLocaleString('fr-FR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>

            <div className="border border-white/[0.07] bg-surface/70 shadow-card rounded-3xl divide-y divide-white/5 overflow-hidden">
              {items.map((p) => {
                // La ligne "pick" n'arrive du serveur que si l'accès est réellement autorisé (RLS) —
                // absent = non débloqué. Le VIP ne lève ce verrou que pour 'paid', jamais pour 'premium'.
                const locked = p.access_level !== 'free' && !p.pick
                return (
                  <div key={p.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      {locked ? (
                        <>
                          <span className="flex items-center gap-1.5 text-sm text-muted">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="4" y="10" width="16" height="10" rx="2" />
                              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                            </svg>
                            Pronostic verrouillé
                          </span>
                          <button
                            onClick={() => handleUnlock(p.id)}
                            disabled={payingId === p.id}
                            className="shrink-0 bg-gold text-ink font-semibold px-3.5 py-1.5 rounded-full text-xs hover:bg-gold/90 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {payingId === p.id ? 'Redirection…' : `Débloquer — ${p.price} FCFA`}
                          </button>
                        </>
                      ) : (
                        <div className="flex-1">
                          <p className="text-sm text-paper/80">
                            {p.pick} {p.odds && <span className="text-muted">(cote {p.odds})</span>}
                          </p>
                          {p.analysis && (
                            <p className="text-xs text-muted mt-1 leading-relaxed">{p.analysis}</p>
                          )}
                        </div>
                      )}
                      {p.access_level !== 'free' && !locked && (
                        <span className="shrink-0 text-xs bg-gold text-ink font-semibold px-2.5 py-1 rounded-full">
                          {p.access_level === 'premium' ? 'Premium' : 'VIP'}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
