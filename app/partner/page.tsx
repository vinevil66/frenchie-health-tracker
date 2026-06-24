'use client'

import Image from 'next/image'
import { Eye, Sun, CloudSun, Thermometer } from 'lucide-react'
import {
  useHealth,
  dayScore,
  computeWalkSafety,
  STOOL_OPTIONS,
  APPETITE_OPTIONS,
  SKIN_OPTIONS,
} from '@/lib/health-store'
import { HealthRing } from '@/components/health-ring'

const SAFETY = {
  safe: { text: 'text-success', dot: 'bg-success', icon: Sun, label: 'Safe to walk' },
  caution: { text: 'text-warning', dot: 'bg-warning', icon: CloudSun, label: 'Caution' },
  danger: { text: 'text-danger', dot: 'bg-danger', icon: Thermometer, label: 'Not now' },
} as const

export default function PartnerPage() {
  const { dog, today } = useHealth()
  const score = dayScore(today)
  const safety = computeWalkSafety()
  const s = SAFETY[safety.status]
  const SafetyIcon = s.icon

  const rows = [
    {
      label: 'Stool',
      value:
        today.stool === null
          ? 'Not logged'
          : STOOL_OPTIONS.find((o) => o.score === today.stool)!.label,
    },
    {
      label: 'Appetite',
      value:
        today.appetite === null
          ? 'Not logged'
          : APPETITE_OPTIONS.find((o) => o.value === today.appetite)!.label,
    },
    {
      label: 'Skin',
      value:
        today.skin === null
          ? 'Not logged'
          : SKIN_OPTIONS.find((o) => o.value === today.skin)!.label,
    },
  ]

  return (
    <div className="flex flex-col gap-7 px-5 pt-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Partner view</p>
          <h1 className="font-serif text-3xl text-foreground">{dog.name}</h1>
        </div>
        <div className="relative size-12 overflow-hidden rounded-full border border-border">
          <Image
            src={dog.photo}
            alt={`${dog.name}, ${dog.breed}`}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
      </header>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-xs text-muted-foreground">
        <Eye className="size-4" />
        Read-only · shared by the primary caretaker
      </div>

      <section className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card px-6 py-8">
        <HealthRing
          value={score}
          size={190}
          label="Wellness"
          sublabel={
            score === null
              ? 'Not logged yet'
              : score >= 85
                ? 'Thriving'
                : score >= 65
                  ? 'Steady'
                  : 'Needs attention'
          }
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={`flex items-center justify-between px-5 py-4 ${
              i !== rows.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <span className="text-sm text-muted-foreground">{r.label}</span>
            <span className="text-sm font-medium text-foreground">
              {r.value}
            </span>
          </div>
        ))}
      </section>

      <section className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
        <span
          className={`flex size-12 items-center justify-center rounded-full bg-secondary ${s.text}`}
        >
          <SafetyIcon className="size-6" strokeWidth={1.75} />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${s.dot}`} />
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Walk safety
            </p>
          </div>
          <p className="mt-0.5 text-sm font-semibold text-foreground">
            {s.label}
          </p>
          <p className="tabular text-xs text-muted-foreground">
            {safety.tempF}°F air · {safety.pavementF}°F pavement
          </p>
        </div>
      </section>

      {today.note && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Caretaker note
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {today.note}
          </p>
        </section>
      )}
    </div>
  )
}
