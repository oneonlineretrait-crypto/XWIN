import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { LogoWordmark } from '../components/Logo'
import { useAuth } from '../lib/AuthContext'

const inputClass =
  'w-full px-5 py-3.5 rounded-full bg-[#1b212c] border border-white/5 text-paper placeholder:text-paper/40 outline-none focus:border-green-500/60 transition-colors'

export function ForgotPassword() {
  const { resetPasswordForEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await resetPasswordForEmail(email)
    setSubmitting(false)
    if (error) return setError(error)
    setSent(true)
  }

  return (
    <div className="min-h-screen xwin-radial-bg flex flex-col items-center justify-center px-6 py-12">
      <LogoWordmark size={40} />

      <div className="w-full max-w-sm mt-8">
        {sent ? (
          <div className="text-center py-6">
            <p className="text-paper/80 mb-4">
              Si un compte existe avec cette adresse, un email vient d'être envoyé avec un lien pour choisir un
              nouveau mot de passe.
            </p>
            <Link to="/auth" className="text-green-500 hover:underline text-sm">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-paper/60 text-sm text-center mb-4">
              Entre ton email, on t'envoie un lien pour réinitialiser ton mot de passe.
            </p>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full bg-green-500 text-white font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Envoi…' : 'Envoyer le lien'}
            </button>
            <p className="text-center text-sm text-paper/60">
              <Link to="/auth" className="text-green-500 hover:underline">
                Retour à la connexion
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
