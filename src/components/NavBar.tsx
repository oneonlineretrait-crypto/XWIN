import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { LogoWordmark } from './Logo'

const links = [
  { to: '/pronostics', label: 'Pronostics' },
  { to: '/montantes', label: 'Montantes' },
  { to: '/produits', label: 'Stratégies & formations' },
  { to: '/abonnement', label: 'VIP' },
  { to: '/profil', label: 'Mon profil' },
]

export function NavBar() {
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="border-b border-white/[0.07] relative z-20">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <NavLink to="/pronostics" className="shrink-0" onClick={() => setOpen(false)}>
          <LogoWordmark size={28} />
        </NavLink>

        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center gap-5 text-sm text-paper/70">
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

        <button
          onClick={signOut}
          className="hidden md:block text-sm border border-white/20 px-3 py-1.5 rounded-2xl hover:bg-white/5 shrink-0"
        >
          Déconnexion
        </button>

        {/* Bouton menu mobile */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
          className="md:hidden p-2 -mr-2 text-paper"
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Menu mobile déroulant */}
      {open && (
        <nav className="md:hidden border-t border-white/[0.07] bg-ink flex flex-col text-sm">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 border-b border-white/5 ${isActive ? 'text-paper bg-white/5' : 'text-paper/70'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <button
            onClick={() => {
              setOpen(false)
              signOut()
            }}
            className="px-4 py-3 text-left text-alert"
          >
            Déconnexion
          </button>
        </nav>
      )}
    </header>
  )
}
