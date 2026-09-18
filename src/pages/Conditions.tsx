import { Link } from 'react-router-dom'
import { LogoWordmark } from '../components/Logo'

export function Conditions() {
  return (
    <div className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <Link to="/auth" className="inline-block mb-8"><LogoWordmark size={28} /></Link>
      <h1 className="font-display text-3xl mb-2">Conditions d'utilisation</h1>
      <p className="text-paper/40 text-sm mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

      <div className="space-y-6 text-paper/70 text-sm leading-relaxed">
        <section>
          <h2 className="text-paper font-medium mb-2">1. Objet</h2>
          <p>
            XWIN est une plateforme qui propose des pronostics sportifs, des stratégies de mise ("montantes")
            et des contenus de formation, en accès gratuit ou payant. L'inscription et l'utilisation du
            service impliquent l'acceptation pleine et entière des présentes conditions.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-medium mb-2">2. Nature du service — avertissement</h2>
          <p>
            Les pronostics, analyses et stratégies proposés sur XWIN sont fournis à titre informatif et
            reflètent une opinion, pas une garantie de résultat. Les paris sportifs comportent un risque de
            perte financière. XWIN ne garantit aucun gain et ne pourra être tenu responsable des pertes
            subies par un utilisateur suite à l'utilisation des contenus du service. Jouez de manière
            responsable et uniquement avec des sommes que vous pouvez vous permettre de perdre.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-medium mb-2">3. Compte utilisateur</h2>
          <p>
            L'accès à certaines fonctionnalités nécessite la création d'un compte. L'utilisateur est
            responsable de la confidentialité de ses identifiants et de toute activité effectuée depuis son
            compte. XWIN se réserve le droit de suspendre un compte en cas d'usage frauduleux ou contraire
            aux présentes conditions.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-medium mb-2">4. Contenus payants et abonnement</h2>
          <p>
            Certains pronostics, montantes, stratégies et formations sont accessibles contre paiement à
            l'unité, ou via un abonnement VIP (hebdomadaire ou mensuel) donnant accès à l'ensemble des
            contenus payants pendant sa durée de validité. Les paiements sont traités par un prestataire
            tiers sécurisé (Stripe). Sauf disposition légale contraire, les achats de contenus numériques
            déjà consultés ne sont pas remboursables.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-medium mb-2">5. Propriété intellectuelle</h2>
          <p>
            L'ensemble des contenus proposés (pronostics, analyses, stratégies, formations) est la propriété
            de XWIN et ne peut être reproduit, redistribué ou revendu sans autorisation préalable.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-medium mb-2">6. Modification des conditions</h2>
          <p>
            XWIN peut modifier les présentes conditions à tout moment. Les utilisateurs seront informés de
            toute modification substantielle via l'application ou par email.
          </p>
        </section>

        <section>
          <h2 className="text-paper font-medium mb-2">7. Contact</h2>
          <p>Pour toute question relative à ces conditions, contactez-nous via l'application.</p>
        </section>
      </div>

      <Link to="/auth" className="inline-block mt-10 text-green-500 hover:underline text-sm">
        ← Retour
      </Link>
    </div>
  )
}
