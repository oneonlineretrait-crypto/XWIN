import { Link } from 'react-router-dom'
import { LogoWordmark } from '../components/Logo'

export function Confidentialite() {
  return (
    <div className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <Link to="/auth" className="inline-block mb-8"><LogoWordmark size={28} /></Link>
      <h1 className="font-display text-3xl mb-2">Politique de confidentialité</h1>
      <p className="text-muted/80 text-sm mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

      <div className="space-y-6 text-paper/70 text-sm leading-relaxed">
        <section>
          <h2 className="text-paper font-medium mb-2">1. Données collectées</h2>
          <p>
            Lors de la création d'un compte et de l'utilisation de XWIN, nous collectons : votre adresse
            email, un pseudo optionnel, et l'historique de vos achats et abonnements sur la plateforme. Nous
            ne collectons ni ne stockons vos données bancaires — celles-ci sont traitées directement par
            notre prestataire de paiement (Stripe).
          </p>
        </section>

        <section>
          <h2 className="text-paper font-medium mb-2">2. Utilisation des données</h2>
          <p>
            Vos données sont utilisées pour : gérer votre compte et votre accès aux contenus, traiter vos
            paiements et abonnements, et vous contacter en cas de besoin lié au service (ex : réinitialisation
            de mot de passe). Nous ne vendons ni ne partageons vos données à des fins publicitaires.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-medium mb-2">3. Sous-traitants</h2>
          <p>
            Nous faisons appel aux prestataires suivants pour faire fonctionner le service : Supabase
            (hébergement des données et authentification), Stripe (traitement des paiements), et nos
            hébergeurs applicatifs. Chacun applique ses propres standards de sécurité.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-medium mb-2">4. Vos droits</h2>
          <p>
            Vous pouvez à tout moment demander l'accès, la rectification ou la suppression de vos données
            personnelles en nous contactant via l'application. La suppression de votre compte entraîne la
            suppression de vos données personnelles, sous réserve des obligations légales de conservation
            (notamment comptables).
          </p>
        </section>

        <section>
          <h2 className="text-paper font-medium mb-2">5. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures techniques raisonnables (chiffrement, contrôle d'accès) pour
            protéger vos données contre tout accès non autorisé.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-medium mb-2">6. Contact</h2>
          <p>Pour toute question relative à vos données, contactez-nous via l'application.</p>
        </section>
      </div>

      <Link to="/auth" className="inline-block mt-10 text-signal hover:underline text-sm">
        ← Retour
      </Link>
    </div>
  )
}
