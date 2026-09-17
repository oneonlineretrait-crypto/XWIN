type IconProps = { className?: string }

function Strategie({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 15l4-5 3 3 6-7" />
      <circle cx="7" cy="15" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="11" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14" cy="13" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="20" cy="6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function Formation({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" />
      <path d="M11 4v16M13 4v16" />
    </svg>
  )
}

const iconMap: Record<string, (p: IconProps) => JSX.Element> = {
  strategie: Strategie,
  formation: Formation,
}

export function ProductIcon({ type, className = 'w-5 h-5' }: { type: string; className?: string }) {
  const Icon = iconMap[type] ?? Formation
  return <Icon className={className} />
}
