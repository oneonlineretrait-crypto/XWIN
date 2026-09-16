import { Link } from 'react-router-dom'

export function PaiementAnnule() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <h1 className="font-display text-3xl mb-4">Paiement annulé</h1>
        <p className="text-paper/70 mb-6">Aucun montant n'a été prélevé.</p>
        <Link to="/pronostics" className="text-signal">Retour aux pronostics →</Link>
      </div>
    </div>
  )
}
