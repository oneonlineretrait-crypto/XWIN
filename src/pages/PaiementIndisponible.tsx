import { Link } from 'react-router-dom'
import { NavBar } from '../components/NavBar'

export function PaiementIndisponible() {
  return (
    <div className="xwin-page-bg min-h-screen">
      <NavBar />
      <main className="px-6 py-10 max-w-lg mx-auto text-center">
        <h1 className="font-display text-2xl mb-4">Paiement en ligne indisponible</h1>
        <p className="text-muted text-sm mb-6 leading-relaxed">
          Le paiement automatique n'est pas encore activé sur XWIN. En attendant, contacte-nous sur
          Telegram pour effectuer ton achat manuellement — on te fournira un code de licence à activer
          directement dans ton profil.
        </p>
        <a
          href="https://t.me/aetuopz"
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-signal text-ink font-semibold px-6 py-3 rounded-2xl hover:bg-signal/90 active:scale-95 transition-all mb-4"
        >
          Nous contacter sur Telegram
        </a>
        <p className="text-muted text-xs">
          Tu as déjà un code ?{' '}
          <Link to="/profil" className="text-signal hover:underline">
            Active-le depuis ton profil
          </Link>
          .
        </p>
      </main>
    </div>
  )
}
