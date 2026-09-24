import { Link } from 'react-router-dom'
import { LogoWordmark } from '../components/Logo'

export function NotFound() {
  return (
    <div className="min-h-screen xwin-radial-bg flex flex-col items-center justify-center px-6 text-center">
      <LogoWordmark size={40} />
      <p className="mt-8 text-paper/80 text-lg">Cette page n'existe pas.</p>
      <Link to="/pronostics" className="mt-4 text-signal hover:underline text-sm">
        Retour à l'accueil
      </Link>
    </div>
  )
}
