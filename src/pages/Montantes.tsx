import { useEffect, useState } from 'react'
import { NavBar } from '../components/NavBar'
import { supabase } from '../lib/supabase'
import { startCheckout } from '../lib/checkout'

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

export function Montantes() {
  const [montantes, setMontantes] = useState<Montante[]>([])
  const [stepsByMontante, setStepsByMontante] = useState<Record<string, Step[]>>({})
  const [payingId, setPayingId] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('montantes').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setMontantes((data as Montante[]) ?? [])
    })
    supabase.from('montante_steps_public').select('*').order('step_number', { ascending: true }).then(({ data }) => {
      const grouped: Record<string, Step[]> = {}
      for (const s of (data as Step[]) ?? []) {
        grouped[s.montante_id] = grouped[s.montante_id] ?? []
        grouped[s.montante_id].push(s)
      }
      setStepsByMontante(grouped)
    })
  }, [])

  async function handleUnlock(id: string) {
    setPayingId(id)
    try {
      await startCheckout({ item_type: 'montante', item_id: id })
    } catch (e) {
      alert((e as Error).message)
      setPayingId(null)
    }
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="px-6 py-10 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl mb-8">Montantes</h1>

        <div className="space-y-6">
          {montantes.map((m) => {
            const steps = stepsByMontante[m.id] ?? []
            const locked = m.access_level === 'paid' && steps.some((s) => s.pick === null)
            return (
              <div key={m.id} className="border border-white/10 rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-medium text-lg">{m.title}</h2>
                  <span className="text-xs text-paper/50 uppercase">{m.status}</span>
                </div>
                {m.description && <p className="text-paper/60 text-sm mb-4">{m.description}</p>}

                <ul className="space-y-1 mb-4">
                  {steps.map((s) => (
                    <li key={s.id} className="text-sm flex justify-between text-paper/70">
                      <span>Étape {s.step_number} — {s.pick ?? '••••••'}</span>
                      <span className={s.result === 'won' ? 'text-green-400' : s.result === 'lost' ? 'text-red-400' : ''}>
                        {s.result}
                      </span>
                    </li>
                  ))}
                </ul>

                {locked && (
                  <button
                    onClick={() => handleUnlock(m.id)}
                    disabled={payingId === m.id}
                    className="bg-signal text-white px-4 py-2 rounded-md text-sm hover:bg-signal/90 disabled:opacity-50"
                  >
                    {payingId === m.id ? 'Redirection…' : `Débloquer — ${m.price} FCFA`}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
