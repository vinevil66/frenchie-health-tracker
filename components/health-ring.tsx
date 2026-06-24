type HealthRingProps = {
  value: number | null // 0-100
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
  trackClass?: string
  progressClass?: string
}

export function HealthRing({
  value,
  size = 220,
  stroke = 14,
  label,
  sublabel,
  trackClass = 'text-secondary',
  progressClass = 'text-primary',
}: HealthRingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = value === null ? 0 : Math.min(100, Math.max(0, value))
  const offset = circumference - (pct / 100) * circumference

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        label
          ? `${label}: ${value === null ? 'no data' : `${value} out of 100`}`
          : undefined
      }
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className={trackClass}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={progressClass}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {value === null ? (
          <span className="font-serif text-4xl text-muted-foreground">--</span>
        ) : (
          <span className="tabular font-serif text-5xl leading-none text-foreground">
            {value}
          </span>
        )}
        {label && (
          <span className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="mt-1 text-xs text-muted-foreground/80">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}
