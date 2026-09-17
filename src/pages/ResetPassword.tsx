import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogoWordmark } from '../components/Logo'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

const inputClass =
  'w-full px-5 py-3.5 rounded-full bg-[#1b212c] border border-white/5 text-paper placeholder:text-paper/40 outline-none focus:border-green-500/60 transition-colors'

export function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Le lien de l'email établit une session "recovery" côté client via l'URL — on attend qu'elle soit prête.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    setSubmitting(true)
    setError(null)
    const { error } = await updatePassword(password)
    setSubmitting(false)
    if (error) return setError(error)
    setDone(true)
    setTimeout(() => navigate('/pronostics', { replace: true }), 1500)
  }

  return (
    <div className="min-h-screen xwin-radial-bg flex flex-col items-center justify-center px-6 py-12">
      <LogoWordmark size={40} />

      <div className="w-full max-w-sm mt-8">
        {!ready && !done && (
          <p className="text-paper/50 text-sm text-center">Vérification du lien…</p>
        )}

        {ready && !done && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-paper/60 text-sm text-center mb-4">Choisis ton nouveau mot de passe.</p>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <input
              type="password"
              required
              placeholder="Confirmer le mot de passe"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full bg-green-500 text-white font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Enregistrement…' : 'Valider le nouveau mot de passe'}
            </button>
          </form>
        )}

        {done && (
          <p className="text-paper/80 text-center">Mot de passe mis à jour — redirection…</p>
        )}
      </div>
    </div>
  )
}
