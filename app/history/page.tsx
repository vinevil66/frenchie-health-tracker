'use client'

import {
  useHealth,
  dayScore,
  stoolPoints,
  STOOL_OPTIONS,
  APPETITE_OPTIONS,
  SKIN_OPTIONS,
} from '@/lib/health-store'
import { cn } from '@/lib/utils'

function weekday(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
  })
}

export default function HistoryPage() {
  const { dog, logs } = useHealth()

  const scored = logs.map((l) => ({ log: l, score: dayScore(l) }))
  const valid = scored.filter((s) => s.score !== null) as {
    log: (typeof logs)[number]
    score: number
  }[]
  const avg =
    valid.length > 0
      ? Math.round(valid.reduce((a, b) => a + b.score, 0) / valid.length)
      : null

  const flares = logs.filter((l) => l.skin === 'flare').length
  const softDays = logs.filter(
    (l) => l.stool !== null && stoolPoints(l.stool) < 60,
  ).length

  return (
    <div className="flex flex-col gap-7 px-5 pt-8">
      <header>
        <p className="text-sm text-muted-foreground">Last 7 days</p>
        <h1 className="font-serif text-3xl text-foreground">
          {dog.name}&apos;s trends
        </h1>
      </header>

      {/* Summary */}
      <section className="grid grid-cols-3 gap-3">
        <Summary label="Avg wellness" value={avg === null ? '--' : `${avg}`} />
        <Summary label="Soft days" value={`${softDays}`} accent={softDays > 1 ? 'warn' : 'ok'} />
        <Summary label="Skin flares" value={`${flares}`} accent={flares > 0 ? 'warn' : 'ok'} />
      </section>

      {/* Wellness line */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Wellness score</h2>
        <WellnessChart data={scored.map((s) => ({ day: weekday(s.log.date), score: s.score }))} />
      </section>

      {/* Stool trend */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Stool consistency
          </h2>
          <span className="text-xs text-muted-foreground">1 hard · 7 liquid</span>
        </div>
        <div className="flex items-end justify-between gap-2">
          {logs.map((l) => {
            const v = l.stool
            const h = v === null ? 0 : (v / 7) * 100
            const good = v !== null && v >= 3 && v <= 4
            const watch = v !== null && (v === 2 || v === 5)
            return (
              <div key={l.date} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-24 w-full items-end justify-center">
                  <div
                    className={cn(
                      'w-5 rounded-t-md transition-all',
                      v === null
                        ? 'bg-secondary'
                        : good
                          ? 'bg-success'
                          : watch
                            ? 'bg-warning'
                            : 'bg-danger',
                    )}
                    style={{ height: `${Math.max(6, h)}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {weekday(l.date)}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Log history list */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Daily entries
        </h2>
        <div className="flex flex-col gap-2">
          {[...logs].reverse().map((l) => {
            const score = dayScore(l)
            const stool = STOOL_OPTIONS.find((o) => o.score === l.stool)?.label
            const appetite = APPETITE_OPTIONS.find(
              (o) => o.value === l.appetite,
            )?.label
            const skin = SKIN_OPTIONS.find((o) => o.value === l.skin)?.label
            return (
              <div
                key={l.date}
                className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="flex flex-col items-center">
                  <span className="tabular font-serif text-xl text-foreground">
                    {score ?? '--'}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {weekday(l.date)}
                  </span>
                </div>
                <div className="flex-1 text-xs text-muted-foreground">
                  {score === null ? (
                    <span>No entry logged</span>
                  ) : (
                    <span>
                      {[stool, appetite, skin].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function Summary({
  label,
  value,
  accent = 'ok',
}: {
  label: string
  value: string
  accent?: 'ok' | 'warn'
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4">
      <span
        className={cn(
          'tabular font-serif text-3xl',
          accent === 'warn' ? 'text-warning' : 'text-foreground',
        )}
      >
        {value}
      </span>
      <span className="text-[11px] uppercase leading-tight tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

function WellnessChart({
  data,
}: {
  data: { day: string; score: number | null }[]
}) {
  const W = 300
  const H = 110
  const pad = 10
  const pts = data.map((d, i) => ({
    x: pad + (i * (W - pad * 2)) / Math.max(1, data.length - 1),
    y:
      d.score === null
        ? null
        : H - pad - ((d.score / 100) * (H - pad * 2)),
    day: d.day,
    score: d.score,
  }))
  const linePts = pts.filter((p) => p.y !== null) as {
    x: number
    y: number
    day: string
    score: number
  }[]
  const path = linePts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={pad}
            x2={W - pad}
            y1={pad + g * (H - pad * 2)}
            y2={pad + g * (H - pad * 2)}
            stroke="currentColor"
            className="text-border"
            strokeWidth="1"
          />
        ))}
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          className="text-primary"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {linePts.map((p) => (
          <circle
            key={p.day + p.x}
            cx={p.x}
            cy={p.y}
            r="3.5"
            className="text-primary"
            fill="currentColor"
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[10px] text-muted-foreground">
        {data.map((d) => (
          <span key={d.day}>{d.day}</span>
        ))}
      </div>
    </div>
  )
}
