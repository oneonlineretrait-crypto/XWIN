import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogoWordmark } from '../components/Logo'
import { useAuth } from '../lib/AuthContext'

export function Splash() {
  const navigate = useNavigate()
  const { session, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    const timer = setTimeout(() => {
      navigate(session ? '/pronostics' : '/accueil', { replace: true })
    }, 1400)
    return () => clearTimeout(timer)
  }, [loading, session, navigate])

  return (
    <div className="min-h-screen xwin-radial-bg flex flex-col items-center justify-center">
      <LogoWordmark size={56} />
      <p className="mt-4 text-paper/50 text-sm">« Xwin - Votre Partenaire de Confiance »</p>
    </div>
  )
}
