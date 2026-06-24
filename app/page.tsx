'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Droplets,
  Utensils,
  Sparkles,
  ChevronRight,
  Sun,
  CloudSun,
  Thermometer,
} from 'lucide-react'
import {
  useHealth,
  dayScore,
  stoolPoints,
  appetitePoints,
  skinPoints,
  computeWalkSafety,
  type WalkSafety,
  STOOL_OPTIONS,
  APPETITE_OPTIONS,
  SKIN_OPTIONS,
} from '@/lib/health-store'
import { HealthRing } from '@/components/health-ring'
import { MetricTile } from '@/components/metric-tile'

const SAFETY_STYLES = {
  safe: { dot: 'bg-success', text: 'text-success', icon: Sun },
  caution: { dot: 'bg-warning', text: 'text-warning', icon: CloudSun },
  danger: { dot: 'bg-danger', text: 'text-danger', icon: Thermometer },
} as const

export default function TodayPage() {
  const { dog, today } = useHealth()
  const score = dayScore(today)
  const [safety, setSafety] = useState<WalkSafety | null>(null)

  useEffect(() => {
    let cancelled = false
    computeWalkSafety().then((result) => {
      if (!cancelled) setSafety(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  const stoolLabel =
    today.stool === null
      ? 'Not logged'
      : STOOL_OPTIONS.find((o) => o.score === today.stool)!.label
  const appetiteLabel =
    today.appetite === null
      ? 'Not logged'
      : APPETITE_OPTIONS.find((o) => o.value === today.appetite)!.label
  const skinLabel =
    today.skin === null
      ? 'Not logged'
      : SKIN_OPTIONS.find((o) => o.value === today.skin)!.label

  const logged = [today.stool, today.appetite, today.skin].filter(
    (v) => v !== null,
  ).length

  return (
    <div className="flex flex-col gap-7 px-5 pt-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="font-serif text-3xl leading-tight text-foreground">
            {dog.name}&apos;s day
          </h1>
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

      {/* Hero ring */}
      <section className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-8">
        <HealthRing
          value={score}
          label="Wellness"
          sublabel={
            score === null
              ? 'Log today to see your score'
              : score >= 85
                ? 'Thriving'
                : score >= 65
                  ? 'Steady'
                  : 'Needs attention'
          }
        />
        <p className="max-w-[15rem] text-balance text-center text-sm text-muted-foreground">
          {logged}/3 logged today
          {score !== null && score < 65
            ? ' · digestion is trending soft'
            : ''}
        </p>
        <Link
          href="/log"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
        >
          {logged === 0 ? 'Start logging' : 'Continue logging'}
        </Link>
      </section>

      {/* Walk safety preview */}
      {safety && (
        <Link
          href="/walk"
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
        >
          <span
            className={`flex size-12 items-center justify-center rounded-full bg-secondary ${SAFETY_STYLES[safety.status].text}`}
          >
            {(() => {
              const SafetyIcon = SAFETY_STYLES[safety.status].icon
              return <SafetyIcon className="size-6" strokeWidth={1.75} />
            })()}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${SAFETY_STYLES[safety.status].dot}`}
              />
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Walk safety
              </p>
            </div>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {safety.headline}
            </p>
            <p className="tabular text-xs text-muted-foreground">
              {safety.tempF}°F air · {safety.pavementF}°F pavement
            </p>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </Link>
      )}

      {/* Metrics */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Today&apos;s signals
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <MetricTile
            icon={Droplets}
            label="Stool"
            value={stoolLabel}
            score={today.stool === null ? null : stoolPoints(today.stool)}
            state={
              today.stool === null
                ? 'neutral'
                : stoolPoints(today.stool) >= 80
                  ? 'good'
                  : stoolPoints(today.stool) >= 50
                    ? 'watch'
                    : 'bad'
            }
          />
          <MetricTile
            icon={Utensils}
            label="Appetite"
            value={appetiteLabel}
            score={
              today.appetite === null ? null : appetitePoints(today.appetite)
            }
            state={
              today.appetite === null
                ? 'neutral'
                : appetitePoints(today.appetite) >= 80
                  ? 'good'
                  : appetitePoints(today.appetite) >= 50
                    ? 'watch'
                    : 'bad'
            }
          />
          <MetricTile
            icon={Sparkles}
            label="Skin"
            value={skinLabel}
            score={today.skin === null ? null : skinPoints(today.skin)}
            state={
              today.skin === null
                ? 'neutral'
                : skinPoints(today.skin) >= 80
                  ? 'good'
                  : skinPoints(today.skin) >= 50
                    ? 'watch'
                    : 'bad'
            }
          />
        </div>
      </section>
    </div>
  )
}
