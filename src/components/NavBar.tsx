import { NavLink } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const links = [
  { to: '/pronostics', label: 'Pronostics' },
  { to: '/montantes', label: 'Montantes' },
  { to: '/produits', label: 'Stratégies & formations' },
  { to: '/abonnement', label: 'VIP' },
]

export function NavBar() {
  const { signOut } = useAuth()
  return (
    <header className="px-6 py-4 flex items-center justify-between border-b border-white/10">
      <span className="font-display text-xl tracking-tight">XWIN</span>
      <nav className="flex gap-5 text-sm text-paper/70">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => (isActive ? 'text-paper' : 'hover:text-paper')}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={signOut} className="text-sm border border-white/20 px-3 py-1.5 rounded-md hover:bg-white/5">
        Déconnexion
      </button>
    </header>
  )
}
