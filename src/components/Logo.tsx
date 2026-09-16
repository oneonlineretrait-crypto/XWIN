export function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 120 86" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="xwin-gradient" x1="0" y1="0" x2="90" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6EE7A0" />
          <stop offset="1" stopColor="#16A34A" />
        </linearGradient>
      </defs>
      <polygon points="0,0 24,0 90,86 66,86" fill="url(#xwin-gradient)" />
      <polygon points="90,0 66,0 40,34 52,50" fill="url(#xwin-gradient)" />
      <polygon points="52,50 40,66 14,86 38,86" fill="url(#xwin-gradient)" />
    </svg>
  )
}

export function LogoWordmark({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2" style={{ fontSize: size }}>
      <Logo size={size} />
      <span className="font-body font-extrabold text-white tracking-tight" style={{ fontSize: size * 0.85 }}>
        WIN
      </span>
    </div>
  )
}
