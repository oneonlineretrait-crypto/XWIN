import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LogoWordmark } from '../components/Logo'
import { useAuth } from '../lib/AuthContext'

type Tab = 'login' | 'signup'

const inputClass =
  'w-full px-5 py-3.5 rounded-full bg-elevated border border-white/5 text-paper placeholder:text-muted/80 outline-none focus:border-green-500/60 transition-colors'

export function Auth() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>(searchParams.get('tab') === 'signup' ? 'signup' : 'login')
  const referralCode = searchParams.get('ref')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  // Connexion
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Inscription
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suConfirm, setSuConfirm] = useState('')

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) return setError(error)
    navigate('/pronostics', { replace: true })
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (suPassword !== suConfirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    setSubmitting(true)
    const { error } = await signUp(suEmail, suPassword, {
      first_name: firstName,
      last_name: lastName,
      ...(referralCode ? { referral_code: referralCode } : {}),
    })
    setSubmitting(false)
    if (error) return setError(error)
    setSignupDone(true)
  }

  return (
    <div className="min-h-screen xwin-radial-bg flex flex-col items-center justify-center px-6 py-12">
      <LogoWordmark size={40} />
      <p className="mt-3 mb-8 text-muted text-sm">Xwin - Votre partenaire de confiance</p>

      <div className="w-full max-w-sm">
        <div className="flex rounded-full bg-surface p-1 mb-6">
          <button
            onClick={() => { setTab('login'); setError(null) }}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-colors ${
              tab === 'login' ? 'bg-signal text-ink' : 'text-muted hover:text-paper/80'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => { setTab('signup'); setError(null) }}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-colors ${
              tab === 'signup' ? 'bg-signal text-ink' : 'text-muted hover:text-paper/80'
            }`}
          >
            Inscription
          </button>
        </div>

        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="email" required placeholder="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            <input type="password" required placeholder="Mot de passe" value={password}
              onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            {error && <p className="text-alert text-sm text-center">{error}</p>}
            <p className="text-center">
              <button
                type="button"
                onClick={() => navigate('/mot-de-passe-oublie')}
                className="text-muted hover:text-paper/80 text-xs underline"
              >
                Mot de passe oublié ?
              </button>
            </p>
            <button type="submit" disabled={submitting}
              className="w-full py-3.5 rounded-full bg-signal text-ink font-medium hover:bg-signal/90 transition-colors disabled:opacity-50">
              {submitting ? 'Connexion…' : 'Se Connecter'}
            </button>
            <p className="text-center text-sm text-muted">
              Pas encore de compte ?{' '}
              <button type="button" onClick={() => setTab('signup')} className="text-signal hover:underline">
                Créer un compte
              </button>
            </p>
          </form>
        )}

        {tab === 'signup' && !signupDone && (
          <form onSubmit={handleSignup} className="space-y-3">
            {referralCode && (
              <p className="text-center text-xs text-signal bg-signal/10 border border-signal/30 rounded-full py-2 px-3">
                🎁 Tu as été invité(e) sur XWIN !
              </p>
            )}
            <input required placeholder="Prénom" value={firstName}
              onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
            <input required placeholder="Nom" value={lastName}
              onChange={(e) => setLastName(e.target.value)} className={inputClass} />
            <input type="email" required placeholder="Adresse email" value={suEmail}
              onChange={(e) => setSuEmail(e.target.value)} className={inputClass} />
            <input type="password" required minLength={6} placeholder="Mot de passe" value={suPassword}
              onChange={(e) => setSuPassword(e.target.value)} className={inputClass} />
            <input type="password" required placeholder="Confirmer mot de passe" value={suConfirm}
              onChange={(e) => setSuConfirm(e.target.value)} className={inputClass} />
            {error && <p className="text-alert text-sm text-center">{error}</p>}
            <button type="submit" disabled={submitting}
              className="w-full py-3.5 rounded-full bg-signal text-ink font-medium hover:bg-signal/90 transition-colors disabled:opacity-50">
              {submitting ? 'Création…' : "S'inscrire"}
            </button>
            <p className="text-center text-sm text-muted">
              Déjà un compte ?{' '}
              <button type="button" onClick={() => setTab('login')} className="text-signal hover:underline">
                Se connecter
              </button>
            </p>
          </form>
        )}

        {tab === 'signup' && signupDone && (
          <div className="text-center py-6">
            <p className="text-paper/80 mb-4">Compte créé — vérifie ta boîte mail pour confirmer, puis connecte-toi.</p>
            <button onClick={() => { setTab('login'); setSignupDone(false) }} className="text-signal hover:underline text-sm">
              Aller à la connexion
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-paper/30">
          En continuant, vous acceptez les{' '}
          <a href="/conditions" className="underline hover:text-muted">Conditions d'utilisation</a> et la{' '}
          <a href="/confidentialite" className="underline hover:text-muted">Politique de confidentialité</a>
        </p>
      </div>
    </div>
  )
}
