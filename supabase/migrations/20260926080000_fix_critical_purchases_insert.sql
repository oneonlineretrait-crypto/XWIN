-- Faille critique : n'importe quel utilisateur connecté pouvait insérer directement dans purchases
-- avec payment_status='paid', débloquant n'importe quel contenu sans payer.
-- Aucune fonctionnalité légitime n'a besoin que le client insère dans cette table :
-- tous les achats réels passent par des fonctions serveur (service_role) qui ignorent cette règle.
drop policy if exists "Creation de ses propres achats" on public.purchases;
