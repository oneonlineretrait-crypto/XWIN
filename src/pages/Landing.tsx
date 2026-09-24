import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogoWordmark } from '../components/Logo'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

type PublicStat = { status: 'pending' | 'won' | 'lost' | 'void' }

export function Landing() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<{ won: number; lost: number; rate: number | null } | null>(null)

  useEffect(() => {
    if (!loading && session) {
      navigate('/pronostics', { replace: true })
    }
  }, [loading, session, navigate])

  useEffect(() => {
    supabase
      .from('pronostics_public')
      .select('status')
      .in('status', ['won', 'lost'])
      .then(({ data }) => {
        const rows = (data as PublicStat[]) ?? []
        const won = rows.filter((r) => r.status === 'won').length
        const lost = rows.filter((r) => r.status === 'lost').length
        const total = won + lost
        setStats({ won, lost, rate: total > 0 ? Math.round((won / total) * 100) : null })
      })
  }, [])

  if (loading || session) return null

  return (
    <div className="min-h-screen xwin-radial-bg">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <LogoWordmark size={26} />
        <Link
          to="/auth"
          className="text-sm text-paper/70 hover:text-paper border border-white/10 px-4 py-2 rounded-full transition-colors"
        >
          Se connecter
        </Link>
      </header>

      {/* Hero */}
      <section className="px-6 pt-10 pb-16 max-w-3xl mx-auto text-center">
        <h1 className="font-display text-4xl sm:text-5xl leading-tight mb-4">
          Des pronostics qui <span className="text-signal">gagnent</span>, pas qui devinent.
        </h1>
        <p className="text-muted text-base sm:text-lg mb-8 max-w-xl mx-auto">
          Pronostics analysés, montantes stratégiques et formations pour parier plus intelligemment —
          gratuit pour commencer, VIP pour aller plus loin.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/auth?tab=signup"
            className="w-full sm:w-auto bg-signal text-ink font-semibold px-8 py-3.5 rounded-full hover:bg-signal/90 active:scale-95 transition-all"
          >
            Créer un compte gratuit
          </Link>
          <Link
            to="/auth"
            className="w-full sm:w-auto text-paper/70 hover:text-paper px-8 py-3.5 rounded-full border border-white/10 transition-colors"
          >
            J'ai déjà un compte
          </Link>
        </div>

        {stats && stats.rate !== null && (
          <div className="mt-10 inline-flex items-center gap-6 border border-white/[0.07] rounded-2xl px-6 py-4">
            <div>
              <p className="text-2xl font-display text-signal">{stats.rate}%</p>
              <p className="text-xs text-muted">de réussite</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl font-display">{stats.won}</p>
              <p className="text-xs text-muted">pronos gagnés</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl font-display">{stats.won + stats.lost}</p>
              <p className="text-xs text-muted">au total</p>
            </div>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="px-6 py-16 border-t border-white/[0.07]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-white/[0.07] bg-surface/70 shadow-card rounded-2xl p-6">
            <p className="text-3xl mb-3">⚽</p>
            <h3 className="font-medium mb-1">Pronostics multi-sport</h3>
            <p className="text-muted text-sm">
              Football, basket et plus — chaque prono accompagné d'une analyse qui explique le choix.
            </p>
          </div>
          <div className="border border-white/[0.07] bg-surface/70 shadow-card rounded-2xl p-6">
            <p className="text-3xl mb-3">📈</p>
            <h3 className="font-medium mb-1">Montantes stratégiques</h3>
            <p className="text-muted text-sm">
              Des stratégies de mise étape par étape, avec un objectif de capital clair.
            </p>
          </div>
          <div className="border border-white/[0.07] bg-surface/70 shadow-card rounded-2xl p-6">
            <p className="text-3xl mb-3">🎓</p>
            <h3 className="font-medium mb-1">Formations & stratégies</h3>
            <p className="text-muted text-sm">
              Apprends les méthodes qui font la différence sur la durée.
            </p>
          </div>
        </div>
      </section>

      {/* VIP */}
      <section className="px-6 py-16 border-t border-white/[0.07]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl mb-3">Passe VIP quand tu es prêt</h2>
          <p className="text-muted text-sm mb-8">
            Accès à tous les pronostics et montantes payants, sans limite, pendant toute la durée de ton abonnement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="border border-white/[0.07] bg-surface/70 shadow-card rounded-2xl p-6 flex-1 max-w-xs mx-auto">
              <p className="text-muted text-sm mb-1">Hebdomadaire</p>
              <p className="text-2xl font-display text-gold">5 999 FCFA</p>
            </div>
            <div className="border border-gold/40 rounded-2xl p-6 flex-1 max-w-xs mx-auto">
              <p className="text-muted text-sm mb-1">Mensuel</p>
              <p className="text-2xl font-display text-gold">15 999 FCFA</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 py-16 border-t border-white/[0.07] text-center">
        <Link
          to="/auth?tab=signup"
          className="inline-block bg-signal text-ink font-semibold px-8 py-3.5 rounded-full hover:bg-signal/90 active:scale-95 transition-all"
        >
          Rejoindre XWIN gratuitement
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/[0.07] text-center text-xs text-muted/80 space-y-2">
        <p>Les paris sportifs comportent des risques. Jouez de manière responsable. Réservé aux 18 ans et plus.</p>
        <p className="space-x-4">
          <Link to="/conditions" className="hover:text-paper/70">Conditions d'utilisation</Link>
          <Link to="/confidentialite" className="hover:text-paper/70">Confidentialité</Link>
        </p>
      </footer>
    </div>
  )
}
