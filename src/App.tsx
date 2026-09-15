export default function App() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-8 py-6 flex items-center justify-between border-b border-white/10">
        <span className="font-display text-xl tracking-tight">XWIN</span>
        <nav className="text-sm text-paper/60">v0.1 — squelette du projet</nav>
      </header>

      <section className="flex-1 flex items-center px-8">
        <div className="max-w-2xl">
          <h1 className="font-display text-5xl leading-tight mb-6">
            La base de XWIN est posée.
          </h1>
          <p className="text-paper/70 text-lg leading-relaxed mb-8">
            Ce squelette React + Vite est installable comme PWA, fonctionne hors-ligne
            et se met à jour automatiquement. Remplace ce contenu par l'écran d'accueil
            réel de la plateforme.
          </p>
          <div className="flex gap-4">
            <button className="bg-signal text-white px-5 py-3 rounded-md hover:bg-signal/90 transition-colors">
              Commencer
            </button>
            <button className="border border-white/20 px-5 py-3 rounded-md hover:bg-white/5 transition-colors">
              En savoir plus
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
