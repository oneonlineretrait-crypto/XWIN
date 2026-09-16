import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) return setError(error)
    navigate('/pronostics', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="font-display text-3xl mb-2">Connexion</h1>
        <p className="text-paper/60 mb-8">
          Pas encore de compte ? <Link to="/inscription" className="text-signal">Inscris-toi</Link>
        </p>
        <label className="block text-sm text-paper/70 mb-1">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-md bg-white/5 border border-white/10 outline-none focus:border-signal" />
        <label className="block text-sm text-paper/70 mb-1">Mot de passe</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-3 rounded-md bg-white/5 border border-white/10 outline-none focus:border-signal" />
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button type="submit" disabled={submitting}
          className="w-full bg-signal text-white px-5 py-3 rounded-md hover:bg-signal/90 transition-colors disabled:opacity-50">
          {submitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
