import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { NavBar } from '../components/NavBar'
import { supabase } from '../lib/supabase'
import { startCheckout } from '../lib/checkout'
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

type Step = {
  id: string
  montante_id: string
  step_number: number
  result: 'pending' | 'won' | 'lost'
  stake: number | null
  odds: number | null
  pick: string | null
  bankroll_after: number | null
}

const resultLabels: Record<Step['result'], string> = {
  pending: 'En attente',
  won: 'Gagné',
  lost: 'Perdu',
}
const resultColors: Record<Step['result'], string> = {
  pending: 'text-paper/50',
  won: 'text-green-400',
  lost: 'text-red-400',
}

export function MontanteDetail() {
  const { montanteId } = useParams<{ montanteId: string }>()
  const [montante, setMontante] = useState<Montante | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const { profile } = useProfile()
  const isVip = profile?.subscription_status === 'vip'

  useEffect(() => {
    if (!montanteId) return
    Promise.all([
      supabase.from('montantes').select('*').eq('id', montanteId).single(),
      supabase
        .from('montante_steps_public')
        .select('*')
        .eq('montante_id', montanteId)
        .order('step_number', { ascending: true }),
    ]).then(([{ data: m }, { data: s }]) => {
      setMontante((m as Montante) ?? null)
      setSteps((s as Step[]) ?? [])
      setLoading(false)
    })
  }, [montanteId])

  async function handleUnlock() {
    if (!montante) return
    setPaying(true)
    try {
      await startCheckout({ item_type: 'montante', item_id: montante.id })
    } catch (e) {
      alert((e as Error).message)
      setPaying(false)
    }
  }

  const unlocked = montante
    ? montante.access_level === 'free' || isVip || steps.some((s) => s.pick !== null)
    : false

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="px-4 sm:px-6 py-8 sm:py-10 max-w-3xl mx-auto">
        <Link to="/montantes" className="text-sm text-paper/50 hover:text-paper/80 mb-6 inline-block">
          ← Toutes les montantes
        </Link>

        {loading && <p className="text-paper/50">Chargement…</p>}
        {!loading && !montante && <p className="text-paper/50">Montante introuvable.</p>}

        {montante && (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="font-display text-2xl sm:text-3xl">{montante.title}</h1>
                <span className="text-xs text-paper/50 shrink-0 ml-3">
                  {montante.status === 'active' ? 'En cours' : montante.status === 'completed' ? 'Terminée' : 'Échouée'}
                </span>
              </div>
              {montante.description && <p className="text-paper/60 text-sm mb-3">{montante.description}</p>}
              <div className="flex items-center gap-4 text-sm text-paper/70">
                {montante.starting_bankroll != null && (
                  <span>Capital : {montante.starting_bankroll.toLocaleString('fr-FR')} FCFA</span>
                )}
                {montante.target_bankroll != null && (
                  <span>Objectif : {montante.target_bankroll.toLocaleString('fr-FR')} FCFA</span>
                )}
              </div>
            </div>

            {!unlocked ? (
              <div className="border border-white/10 rounded-lg p-8 text-center">
                <p className="text-paper/60 text-sm mb-4">
                  Les étapes de cette montante sont réservées aux acheteurs (ou aux membres VIP).
                </p>
                <button
                  onClick={handleUnlock}
                  disabled={paying}
                  className="bg-signal text-white px-5 py-2.5 rounded-md text-sm hover:bg-signal/90 disabled:opacity-50"
                >
                  {paying ? 'Redirection…' : `Débloquer — ${montante.price} FCFA`}
                </button>
              </div>
            ) : (
              <div className="border border-white/10 rounded-lg divide-y divide-white/5 overflow-hidden">
                {steps.map((s) => (
                  <div key={s.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">Étape {s.step_number}</span>
                      <span className={`text-xs ${resultColors[s.result]}`}>{resultLabels[s.result]}</span>
                    </div>
                    {s.pick && (
                      <p className="text-sm text-paper/80">
                        Miser sur : <span className="text-paper">{s.pick}</span>
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-xs text-paper/50">
                      {s.stake != null && <span>Mise : {s.stake.toLocaleString('fr-FR')} FCFA</span>}
                      {s.odds != null && <span>Cote : {s.odds}</span>}
                      {s.bankroll_after != null && (
                        <span>Capital après : {s.bankroll_after.toLocaleString('fr-FR')} FCFA</span>
                      )}
                    </div>
                  </div>
                ))}
                {steps.length === 0 && (
                  <p className="px-5 py-4 text-paper/50 text-sm">Aucune étape pour le moment.</p>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
