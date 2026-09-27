# Règles de gestion — XWIN (à vérifier une par une)

Chaque règle : ce qu'elle dit → comment la tester → ce qu'on doit observer.

## 1. Comptes & identité

**R1.1** — Chaque compte a un identifiant public unique et fixe (ex. `A1B2C3D4`), généré une seule fois, qui ne change jamais.
→ Test : recharger Profil plusieurs fois, sur plusieurs jours. L'identifiant doit être identique à chaque fois.

**R1.2** — L'identifiant public sert à l'admin pour retrouver un compte, sans avoir besoin de l'email.
→ Test : dans l'admin → Licences, chercher un compte en tapant uniquement son identifiant.

**R1.3** — Un compte peut être créé avec un code de parrainage (`?ref=...` dans le lien d'inscription).
→ Test : ouvrir un lien d'inscription avec `?ref=CODE`, vérifier que le bandeau "tu as été invité" apparaît au moment de l'inscription.

**R1.4 (à vérifier côté base, pas visible dans le code déployé)** — Le parrain reçoit +7 jours de VIP au premier achat de son filleul.
→ Test : compte A parraine compte B. B fait un premier achat. Vérifier que la date d'expiration VIP de A avance de 7 jours.

## 2. VIP (abonnement)

**R2.1** — Il existe deux formules VIP : hebdomadaire (5999 FCFA) et mensuel (15999 FCFA), en FCFA.
→ Test : page abonnement VIP, vérifier les deux prix affichés.

**R2.2** — Une licence VIP activée dans **Profil** ajoute des jours à la date d'expiration existante (elle ne l'écrase pas si le compte est déjà VIP).
→ Test : compte VIP jusqu'au 10/10. Activer une licence VIP de 30 jours. Nouvelle date attendue : 09/11 (10/10 + 30j), pas juste "aujourd'hui + 30j".

**R2.3** — Le champ "Activer une licence" de Profil n'accepte et n'affiche que des activations VIP. Un code "Article" y fonctionne techniquement mais le message renvoie vers la bonne page au lieu de prétendre que c'est du VIP.
→ Test : activer un code "Article" (produit) dans Profil → le message doit dire d'aller sur la page du produit, pas "bienvenue VIP".

## 3. Pronostics

**R3.1** — Un pronostic gratuit (`access_level = free`) est visible par tout le monde, y compris déconnecté.
→ Test : ouvrir la page d'un match sans être connecté, vérifier qu'un pronostic gratuit s'affiche en entier.

**R3.2** — Un pronostic `paid` est débloqué automatiquement pour un compte VIP, sans achat ni licence.
→ Test : compte VIP actif → un pronostic `paid` doit afficher le pick directement.

**R3.3** — Un pronostic `premium` n'est **jamais** débloqué par le VIP seul — il faut un achat ou une licence dédiée à ce pronostic précis.
→ Test : compte VIP actif, mais sans achat → un pronostic `premium` doit rester verrouillé.

**R3.4** — On peut débloquer un pronostic précis en achetant (CinetPay) ou en activant un code de licence directement sur la page du match.
→ Test : générer une licence "Article → Pronostic" pour un pronostic précis, l'activer sur la page du match concerné → il doit se débloquer, et lui seul.

**R3.5** — Un pronostic non débloqué ne montre ni le pick, ni la cote, ni l'analyse (masqués côté serveur, pas juste caché visuellement).
→ Test : inspecter la réponse réseau (onglet réseau du navigateur) sur un pronostic verrouillé → les champs `pick`/`odds`/`analysis` doivent être `null`, pas juste absents de l'affichage.

## 4. Montantes

**R4.1 à R4.5** — Mêmes règles que les pronostics (gratuit visible à tous, `paid` débloqué par VIP, `premium` jamais par le seul VIP, déblocage par achat ou licence sur la page de la montante, masquage serveur des étapes).
→ Tests : identiques à la section 3, appliqués à une montante.

**R4.6** — Le statut d'une montante (`active` / `completed` / `failed`) est indépendant du niveau d'accès (`free`/`paid`/`premium`) — les deux ne doivent jamais se mélanger.
→ Test : vérifier qu'une montante `failed` peut être `free` ou `premium` indifféremment, sans lien entre les deux colonnes.

## 5. Produits (stratégies & formations)

**R5.1** — Un produit n'est **jamais** débloqué par le VIP — uniquement par achat ou licence dédiée. Pas d'exception.
→ Test : compte VIP actif, aucun achat → tous les produits doivent rester verrouillés.

**R5.2** — Un produit avec fichier uploadé (PDF/vidéo) n'est accessible que via une URL signée à durée limitée (5 minutes), jamais par lien direct permanent.
→ Test : ouvrir un produit acheté, copier l'URL du fichier affiché, la réessayer 10 minutes plus tard dans un nouvel onglet → doit échouer (lien expiré).

**R5.3** — Le contenu affiché porte un filigrane discret (identifiant du compte) pour tracer une fuite éventuelle.
→ Test : ouvrir un produit débloqué, vérifier la présence du filigrane en transparence sur le PDF/la vidéo.

**R5.4** — Un produit sans fichier uploadé (ancien lien externe, pas encore migré) reste accessible via ce lien externe, sans filigrane ni expiration — à migrer un par un.
→ Test : lister les produits encore en "lien externe (non protégé)" dans l'admin, les re-uploader progressivement.

## 6. Paiement (CinetPay)

**R6.1** — Le site n'accepte que Mobile Money et carte via CinetPay, en FCFA — pas Stripe (abandonné).
→ Test : lancer un achat, vérifier que seul CinetPay apparaît.

**R6.2** — Une notification de paiement de CinetPay n'est jamais crue sur parole : le serveur revérifie toujours directement auprès de CinetPay avant de valider.
→ Vérifié dans le code (`cinetpay-notify`), pas testable manuellement — c'est une protection contre les fausses notifications.

**R6.3** — Un même paiement ne peut jamais être compté deux fois (webhook idempotent).
→ Test : si possible, renvoyer deux fois la même notification de paiement (via un outil comme Postman) → le second envoi ne doit rien changer.

**R6.4 — Si le paiement en ligne est indisponible**, le site affiche un message honnête (pas de fausse excuse) et redirige vers Telegram (@aetuopz) pour un paiement manuel + licence.
→ Test : déjà vérifié précédemment, message confirmé honnête.

## 7. Licences (VIP et Article)

**R7.1** — Une licence n'est valable que sur le compte pour lequel elle a été créée — jamais transférable à un autre compte.
→ Test : générer une licence pour le compte A, essayer de l'activer depuis le compte B → doit être refusé ("pas valable sur ce compte").

**R7.2** — Une licence ne peut être utilisée qu'une seule fois.
→ Test : activer une licence, puis réessayer le même code → doit être refusé ("déjà utilisé").

**R7.3** — Une licence "Article" débloque **uniquement** l'article choisi à sa création (pas VIP, pas un autre article).
→ Test : générer une licence pour le Produit X, l'activer → seul le Produit X se débloque ; les autres produits/montantes/pronostics restent verrouillés.

**R7.4** — L'admin doit explicitement choisir "Article précis" (le formulaire est sur "VIP" par défaut) — sinon la licence créée sera une licence VIP par erreur.
→ Vigilance humaine : toujours vérifier le radio bouton avant de cliquer "Générer".

## 8. Notifications push

**R8.1** — Seul un admin peut envoyer une notification push à tous les abonnés.
→ Test : essayer d'appeler la fonction d'envoi depuis un compte non-admin → doit être refusé.

**R8.2** — Un abonnement push cassé (désinstallation, navigateur qui ne répond plus) est automatiquement retiré de la liste après un échec d'envoi.
→ Test : difficile à vérifier manuellement ; à surveiller dans les logs de la fonction `send-push-notification`.

## 9. Permissions admin

**R9.1** — Seul un compte avec `role = admin` peut écrire dans matches / montantes / pronostics / produits / licences.
→ Test : vérifié dans les policies RLS (`is_admin()`), confirmé par l'audit déjà fait.

**R9.2** — La lecture publique des catalogues (matchs, montantes) passe par les tables/vues publiques — jamais un accès direct aux tables brutes pour un compte normal.
→ Déjà vérifié dans l'audit RLS : pas de policy `SELECT` publique sur les tables brutes sensibles.

**R9.3 (corrigée)** — Un compte normal ne peut jamais insérer directement une ligne "achat payé" — seuls les serveurs (paiement confirmé, licence activée) peuvent le faire.
→ Déjà corrigée (faille critique supprimée). Test : essayer depuis la console du navigateur `supabase.from('purchases').insert(...)` avec un compte normal → doit être refusé.

---

## Comment on procède

On prend une section à la fois (en commençant par la 3 ou la 7, les plus concrètes pour toi maintenant), tu testes, tu me dis le résultat exact, je corrige si besoin — puis section suivante.
