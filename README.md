# XWIN

Plateforme XWIN — squelette d'app PWA (React + Vite + TypeScript + Tailwind),
pensé pour monter en charge vers un volume important d'utilisateurs (bundle
splitting, cache réseau via service worker, shell app précaché).

## Démarrer en local

```bash
npm install
npm run dev
```

## Build production

```bash
npm run build
npm run preview
```

Le build génère un service worker (via `vite-plugin-pwa`) et un
`manifest.webmanifest` — l'app est installable sur mobile et desktop dès le
premier déploiement.

## Icônes PWA

Remplace les fichiers dans `public/icons/` par tes vraies icônes :
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

## Créer le dépôt GitHub et pousser ce projet

```bash
cd xwin
git init
git add .
git commit -m "Initial commit — squelette XWIN"
git branch -M main
git remote add origin https://github.com/<ton-compte>/XWIN.git
git push -u origin main
```

(Crée d'abord le dépôt vide "XWIN" sur github.com/new, sans README ni
.gitignore générés automatiquement, pour éviter un conflit à la première
poussée.)

## Prochaines étapes suggérées

- Brancher un backend / API (le cache PWA est déjà configuré en
  network-first pour tout ce qui passe par `/api/*`)
- Définir l'architecture pour 2M d'utilisateurs (CDN, autoscaling,
  base de données, stratégie de cache serveur)
- Remplacer les icônes placeholder dans `public/icons/`
- Personnaliser la palette et la typographie dans `tailwind.config.js`
