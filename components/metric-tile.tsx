import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MetricTile({
  icon: Icon,
  label,
  value,
  score,
  state = 'neutral',
}: {
  icon: LucideIcon
  label: string
  value: string
  score: number | null
  state?: 'good' | 'watch' | 'bad' | 'neutral'
}) {
  const bar =
    state === 'good'
      ? 'bg-success'
      : state === 'watch'
        ? 'bg-warning'
        : state === 'bad'
          ? 'bg-danger'
          : 'bg-muted-foreground/40'

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <Icon className="size-5 text-muted-foreground" strokeWidth={1.75} />
        <span className="tabular text-xs text-muted-foreground">
          {score === null ? '--' : score}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{value}</p>
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn('h-full rounded-full transition-all', bar)}
          style={{ width: `${score ?? 6}%` }}
        />
      </div>
    </div>
  )
}
