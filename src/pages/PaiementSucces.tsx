import { Link } from 'react-router-dom'

export function PaiementSucces() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <h1 className="font-display text-3xl mb-4">Paiement réussi</h1>
        <p className="text-paper/70 mb-6">
          Ton achat est confirmé. Le contenu se débloque en quelques secondes.
        </p>
        <Link to="/pronostics" className="text-signal">Retour aux pronostics →</Link>
      </div>
    </div>
  )
}
