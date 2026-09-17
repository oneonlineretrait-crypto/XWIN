type IconProps = { className?: string }

function Football({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.2 15.8 10l-1.4 4.4h-4.8L8.2 10 12 7.2Z" />
      <path d="M12 3v4.2M6.6 6.2l2.6 2M17.4 6.2l-2.6 2M5.3 15l3.5-.6M18.7 15l-3.5-.6M9.4 20.5 10.6 16M14.6 20.5 13.4 16" />
    </svg>
  )
}

function Basketball({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3v18M5.3 5.3c3.6 3.6 3.6 9.8 0 13.4M18.7 5.3c-3.6 3.6-3.6 9.8 0 13.4" />
    </svg>
  )
}

function Tennis({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M4.5 7c3 1.5 3 8.5 0 10M19.5 7c-3 1.5-3 8.5 0 10" />
    </svg>
  )
}

function Volleyball({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c3 2.5 4 6 2 9M6 6c2.5 3 2.5 7 0 10M3.5 13.5c3 .8 6 .3 8-1.5" />
    </svg>
  )
}

function Rugby({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="12" rx="9" ry="6" />
      <path d="M6.5 8.5 17.5 15.5M9 7.5l1.5 1.5M8 10l1.5 1.5M13.5 12.5 15 14M14.5 15 16 16.5" />
    </svg>
  )
}

function Handball({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18" strokeDasharray="2.5 2.5" />
    </svg>
  )
}

function Hockey({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="16" width="8" height="2.5" rx="0.5" transform="rotate(-15 3 16)" />
      <path d="M10.5 15.5 15 6" />
      <circle cx="17.5" cy="17" r="2" />
    </svg>
  )
}

function Boxing({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 13V9a3 3 0 0 1 6 0v3M11 12V7.5a2.5 2.5 0 0 1 5 0V12M16 12.5V9a2.2 2.2 0 0 1 4.4 0v5c0 3.3-2.5 6-6 6h-2c-3 0-5-1.6-6.6-4L4 12.8" />
    </svg>
  )
}

function Trophy({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H5a3 3 0 0 0 3 4M16 5h3a3 3 0 0 1-3 4M12 12v3M9 19h6M9 19c0-1.7 1.3-2 3-2s3 .3 3 2" />
    </svg>
  )
}

const iconMap: Record<string, (p: IconProps) => JSX.Element> = {
  football: Football,
  foot: Football,
  soccer: Football,
  basketball: Basketball,
  basket: Basketball,
  tennis: Tennis,
  volleyball: Volleyball,
  volley: Volleyball,
  rugby: Rugby,
  handball: Handball,
  hockey: Hockey,
  boxe: Boxing,
  boxing: Boxing,
  mma: Boxing,
}

export function SportIcon({ sport, className = 'w-4 h-4' }: { sport: string; className?: string }) {
  const key = sport.trim().toLowerCase()
  const Icon = iconMap[key] ?? Trophy
  return <Icon className={className} />
}
