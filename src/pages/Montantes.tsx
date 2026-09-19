import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { supabase } from '../lib/supabase'
import { useProfile } from '../lib/useProfile'

type Montante = {
  id: string
  title: string
  description: string | null
  starting_bankroll: number | null
  target_bankroll: number | null
  access_level: 'free' | 'paid'
  price: number | null
  status: 'active' | 'completed' | 'failed'
}

const statusLabels: Record<Montante['status'], string> = {
  active: 'En cours',
  completed: 'Terminée',
  failed: 'Échouée',
}

export function Montantes() {
  const [montantes, setMontantes] = useState<Montante[]>([])
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const { profile } = useProfile()
  const isVip = profile?.subscription_status === 'vip'

  useEffect(() => {
    Promise.all([
      supabase.from('montantes').select('*').order('created_at', { ascending: false }),
      supabase.from('montante_steps_public').select('montante_id, pick'),
    ]).then(([{ data: m }, { data: s }]) => {
      setMontantes((m as Montante[]) ?? [])
      // Une montante est débloquée si au moins une étape renvoie un pick non masqué (RLS déjà appliquée côté serveur)
      const unlocked = new Set<string>()
      for (const row of (s as { montante_id: string; pick: string | null }[]) ?? []) {
        if (row.pick !== null) unlocked.add(row.montante_id)
      }
      setUnlockedIds(unlocked)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="px-4 sm:px-6 py-8 sm:py-10 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl mb-6">Montantes</h1>

        {loading && <p className="text-paper/50">Chargement…</p>}
        {!loading && montantes.length === 0 && (
          <p className="text-paper/50">Aucune montante pour le moment.</p>
        )}

        <div className="space-y-4">
          {montantes.map((m) => {
            const unlocked = m.access_level === 'free' || isVip || unlockedIds.has(m.id)
            return (
              <Link
                key={m.id}
                to={`/montantes/${m.id}`}
                className="block border border-white/10 rounded-2xl p-5 hover:border-signal/40 hover:bg-white/[0.03] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-signal/10 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-medium text-lg">{m.title}</h2>
                  <span className="text-xs text-paper/50">{statusLabels[m.status]}</span>
                </div>

                {m.description && <p className="text-paper/60 text-sm mb-3">{m.description}</p>}

                <div className="flex items-center gap-4 text-sm text-paper/70 mb-3">
                  {m.starting_bankroll != null && (
                    <span>Capital : {m.starting_bankroll.toLocaleString('fr-FR')} FCFA</span>
                  )}
                  {m.target_bankroll != null && (
                    <span>Objectif : {m.target_bankroll.toLocaleString('fr-FR')} FCFA</span>
                  )}
                </div>

                {unlocked ? (
                  <span className="text-signal text-sm font-medium">Voir les étapes →</span>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-paper/50">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="4" y="10" width="16" height="10" rx="2" />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      </svg>
                      Verrouillée
                    </span>
                    <span className="text-xs bg-gold text-ink font-semibold px-2.5 py-1 rounded-full">
                      {m.price} FCFA
                    </span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
