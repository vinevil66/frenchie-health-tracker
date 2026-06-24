'use client'

import { useEffect, useState } from 'react'
import { Sun, CloudSun, Thermometer, Droplets, Footprints, Clock, Loader } from 'lucide-react'
import { computeWalkSafety, type WalkSafety } from '@/lib/health-store'

const STATUS = {
  safe: {
    label: 'Safe to walk',
    chip: 'bg-success/15 text-success border-success/30',
    ring: 'text-success',
    icon: Sun,
  },
  caution: {
    label: 'Caution',
    chip: 'bg-warning/15 text-warning border-warning/30',
    ring: 'text-warning',
    icon: CloudSun,
  },
  danger: {
    label: 'Not now',
    chip: 'bg-danger/15 text-danger border-danger/30',
    ring: 'text-danger',
    icon: Thermometer,
  },
} as const

export default function WalkPage() {
  // Starts null on both server and client renders, so the skeleton below is
  // the only markup produced until the effect resolves on the client —
  // avoids a hydration mismatch from rendering live weather data server-side.
  const [safety, setSafety] = useState<WalkSafety | null>(null)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let cancelled = false

    const loadWeather = async () => {
      const data = await computeWalkSafety()
      if (!cancelled) setSafety(data)
    }

    loadWeather()

    // Refresh every 5 minutes
    const weatherInterval = setInterval(loadWeather, 5 * 60 * 1000)
    // Tick every 60s so outOfWindow flips at exactly 7am/7pm
    const clockInterval = setInterval(() => setNow(new Date()), 60_000)
    return () => {
      cancelled = true
      clearInterval(weatherInterval)
      clearInterval(clockInterval)
    }
  }, [])

  if (!safety) {
    return (
      <div className="flex flex-col gap-7 px-5 pt-8 items-center justify-center min-h-screen">
        <Loader className="size-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading weather data...</p>
      </div>
    )
  }
  const st = STATUS[safety.status]
  const StatusIcon = st.icon

  // Sun arc: map real elevation (0-90°) to a point along a top semicircle.
  // Direction depends on AM/PM since the same elevation occurs once rising
  // and once setting, and there's no other signal to tell them apart.
  const hour = now.getHours()
  const t =
    hour < 12
      ? safety.sunElevation / 90
      : 1 - safety.sunElevation / 90
  const sunX = 30 + (240 * (1 - Math.cos(t * Math.PI))) / 2
  const sunY = 110 - Math.sin(t * Math.PI) * 80
  const outOfWindow = hour < 7 || hour >= 19
  const message =
    hour < 7
      ? 'Early and cool — best time of day'
      : 'Heat has passed — best time of day'

  const advice =
    safety.status === 'safe'
      ? 'Pavement is cool enough and UV is moderate. A normal-length walk is fine — bring water on warmer stretches.'
      : safety.status === 'caution'
        ? 'Keep it short, stick to shade and grass, and do the 7-second pavement test with your hand. Frenchies overheat fast.'
        : 'Skip the walk for now. Brachycephalic dogs can overheat dangerously and pavement can burn paw pads. Try a potty break in shade instead.'

  return (
    <div className="flex flex-col gap-7 px-5 pt-8">
      <header>
        <p className="text-sm text-muted-foreground">Right now</p>
        <h1 className="font-serif text-3xl text-foreground">Walk safety</h1>
      </header>

      {/* Verdict card */}
      <section className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-8">
        <span
          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${st.chip}`}
        >
          <span className="size-1.5 rounded-full bg-current" />
          {st.label}
        </span>
        <StatusIcon className={`size-12 ${st.ring}`} strokeWidth={1.5} />
        <h2 className="text-balance text-center font-serif text-2xl text-foreground">
          {safety.headline}
        </h2>
        <p className="max-w-xs text-balance text-center text-sm leading-relaxed text-muted-foreground">
          {advice}
        </p>
      </section>

      {/* Sun position */}
      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Sun position</h3>
          <span className="tabular text-xs text-muted-foreground">
            {safety.sunElevation}° elevation
          </span>
        </div>
        <div className="relative">
          <svg
            viewBox="0 0 300 130"
            className="w-full"
            style={outOfWindow ? { opacity: 0.2 } : undefined}
            aria-hidden="true"
          >
            <line
              x1="10"
              y1="110"
              x2="290"
              y2="110"
              stroke="currentColor"
              className="text-border"
              strokeWidth="1"
            />
            <path
              d="M30 110 A 120 120 0 0 1 270 110"
              fill="none"
              stroke="currentColor"
              className="text-secondary"
              strokeWidth="2"
              strokeDasharray="4 6"
            />
            {safety.sunElevation > 0 && (
              <>
                <circle
                  cx={sunX}
                  cy={sunY}
                  r="9"
                  className={st.ring}
                  fill="currentColor"
                />
                <circle
                  cx={sunX}
                  cy={sunY}
                  r="15"
                  className={st.ring}
                  fill="currentColor"
                  opacity="0.18"
                />
              </>
            )}
          </svg>
          {outOfWindow && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="max-w-xs mx-auto text-center font-serif text-xl sm:text-2xl text-foreground">
                {message}
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-between text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>7 AM</span>
          <span>Noon</span>
          <span>7 PM</span>
        </div>
      </section>

      {/* Conditions grid */}
      <section className="grid grid-cols-2 gap-3">
        <Stat icon={Thermometer} label="Air temp" value={`${safety.tempF}°F`} sub={`Feels ${safety.feelsLikeF}°F`} />
        <Stat icon={Footprints} label="Pavement" value={`${safety.pavementF}°F`} sub={safety.pavementF >= 125 ? 'Burn risk' : 'Paw-safe'} />
        <Stat icon={Sun} label="UV index" value={`${safety.uv}`} sub={safety.uv >= 7 ? 'Very high' : safety.uv >= 4 ? 'Moderate' : 'Low'} />
        <Stat icon={Droplets} label="Humidity" value={`${safety.humidity}%`} sub={safety.humidity >= 60 ? 'Muggy' : 'Comfortable'} />
      </section>

      {/* Best window */}
      <section className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/10 p-4">
        <Clock className="size-6 text-primary" strokeWidth={1.75} />
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-primary/80">
            Best window today
          </p>
          <p className="text-sm font-semibold text-foreground">
            {safety.bestWindow}
          </p>
        </div>
      </section>

      {/* Last updated */}
      <div className="flex items-center justify-between px-2 py-4 rounded-lg bg-secondary/30">
        <p className="text-xs text-muted-foreground">
          Data from OpenMeteo • Los Angeles, CA
        </p>
        <p className="text-xs font-medium text-primary">
          Updated {safety.lastUpdated}
        </p>
      </div>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Sun
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
      <Icon className="size-5 text-muted-foreground" strokeWidth={1.75} />
      <div>
        <p className="tabular font-serif text-2xl text-foreground">{value}</p>
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground/80">{sub}</p>
      </div>
    </div>
  )
}
