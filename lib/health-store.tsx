'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/* ----------------------------- Types ----------------------------- */

export type StoolScore = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type AppetiteScore = 'none' | 'low' | 'normal' | 'eager'
export type SkinSeverity = 'clear' | 'mild' | 'flare'

export type DayLog = {
  date: string // ISO date (YYYY-MM-DD)
  stool: StoolScore | null
  appetite: AppetiteScore | null
  skin: SkinSeverity | null
  skinAreas: string[]
  note?: string
}

export type Dog = {
  name: string
  breed: string
  ageYears: number
  weightLbs: number
  photo: string
}

/* --------------------------- Reference --------------------------- */

// Stool: clinically 1 (very hard) .. 7 (liquid). 3–4 is ideal.
export const STOOL_OPTIONS: {
  score: StoolScore
  label: string
  desc: string
}[] = [
  { score: 1, label: 'Pellets', desc: 'Hard separate lumps' },
  { score: 2, label: 'Firm', desc: 'Log-shaped, segmented' },
  { score: 3, label: 'Ideal', desc: 'Formed, easy to pick up' },
  { score: 4, label: 'Ideal+', desc: 'Soft but holds shape' },
  { score: 5, label: 'Soft', desc: 'Loses some shape' },
  { score: 6, label: 'Mushy', desc: 'Mushy, no shape' },
  { score: 7, label: 'Liquid', desc: 'Watery, no solids' },
]

export const APPETITE_OPTIONS: {
  value: AppetiteScore
  label: string
  desc: string
}[] = [
  { value: 'none', label: 'Refused', desc: 'Would not eat' },
  { value: 'low', label: 'Picky', desc: 'Ate less than usual' },
  { value: 'normal', label: 'Normal', desc: 'Finished the bowl' },
  { value: 'eager', label: 'Eager', desc: 'Wolfed it down' },
]

export const SKIN_OPTIONS: {
  value: SkinSeverity
  label: string
  desc: string
}[] = [
  { value: 'clear', label: 'Clear', desc: 'No irritation today' },
  { value: 'mild', label: 'Mild', desc: 'Light itch or redness' },
  { value: 'flare', label: 'Flare', desc: 'Active hot spot or rash' },
]

export const SKIN_AREAS = [
  'Paws',
  'Face folds',
  'Belly',
  'Ears',
  'Armpits',
  'Tail pocket',
]

/* ------------------------- Seed (mock) data ----------------------- */

function isoDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

const SEED: DayLog[] = [
  { date: isoDaysAgo(6), stool: 3, appetite: 'normal', skin: 'clear', skinAreas: [] },
  { date: isoDaysAgo(5), stool: 4, appetite: 'eager', skin: 'clear', skinAreas: [] },
  { date: isoDaysAgo(4), stool: 5, appetite: 'normal', skin: 'mild', skinAreas: ['Paws'] },
  { date: isoDaysAgo(3), stool: 6, appetite: 'low', skin: 'mild', skinAreas: ['Paws', 'Belly'] },
  { date: isoDaysAgo(2), stool: 4, appetite: 'normal', skin: 'clear', skinAreas: [] },
  { date: isoDaysAgo(1), stool: 3, appetite: 'eager', skin: 'clear', skinAreas: [] },
]

const DOG: Dog = {
  name: 'Olive',
  breed: 'French Bulldog',
  ageYears: 3,
  weightLbs: 24,
  photo: '/frenchie.png',
}

/* --------------------------- Scoring ------------------------------ */

export function stoolPoints(s: StoolScore | null): number {
  if (s === null) return 0
  // distance from ideal (3.5)
  const map: Record<StoolScore, number> = {
    1: 55,
    2: 80,
    3: 100,
    4: 100,
    5: 78,
    6: 50,
    7: 25,
  }
  return map[s]
}

export function appetitePoints(a: AppetiteScore | null): number {
  if (a === null) return 0
  return { none: 20, low: 60, normal: 100, eager: 92 }[a]
}

export function skinPoints(s: SkinSeverity | null): number {
  if (s === null) return 0
  return { clear: 100, mild: 65, flare: 30 }[s]
}

export function dayScore(log: DayLog): number | null {
  if (log.stool === null && log.appetite === null && log.skin === null)
    return null
  const parts = [
    stoolPoints(log.stool),
    appetitePoints(log.appetite),
    skinPoints(log.skin),
  ]
  return Math.round((parts[0] + parts[1] + parts[2]) / 3)
}

/* --------------------- Simulated walk safety ---------------------- */

export type WalkSafety = {
  status: 'safe' | 'caution' | 'danger'
  headline: string
  tempF: number
  feelsLikeF: number
  humidity: number
  uv: number
  pavementF: number
  sunElevation: number // degrees above horizon
  bestWindow: string
}

// Deterministic-ish simulation based on current hour so the demo feels live.
export function computeWalkSafety(now = new Date()): WalkSafety {
  const hour = now.getHours() + now.getMinutes() / 60

  // Sun elevation: peaks at solar noon (~13:00), 0 at ~6 and ~20.
  const sunElevation = Math.max(
    0,
    Math.round(68 * Math.sin((Math.PI * (hour - 6)) / 14)),
  )

  // Air temp curve: cool overnight, warm mid-afternoon.
  const tempF = Math.round(62 + 22 * Math.sin((Math.PI * (hour - 5)) / 16))
  const humidity = Math.round(48 + 18 * Math.cos((Math.PI * hour) / 12))
  const uv = Math.max(0, Math.round((sunElevation / 68) * 9))
  // Pavement runs much hotter than air under direct sun.
  const pavementF = Math.round(tempF + sunElevation * 0.55)
  const feelsLikeF = Math.round(tempF + (humidity > 60 ? 4 : 0))

  let status: WalkSafety['status'] = 'safe'
  let headline = 'Great conditions for a walk'

  if (pavementF >= 125 || tempF >= 84) {
    status = 'danger'
    headline = 'Too hot — brachycephalic risk'
  } else if (pavementF >= 110 || tempF >= 78 || uv >= 7) {
    status = 'caution'
    headline = 'Keep it short and shaded'
  }

  return {
    status,
    headline,
    tempF,
    feelsLikeF,
    humidity,
    uv,
    pavementF,
    sunElevation,
    bestWindow: hour < 12 ? 'Now – 10:30 AM' : 'After 6:30 PM',
  }
}

/* ----------------------------- Store ------------------------------ */

type HealthContextValue = {
  dog: Dog
  logs: DayLog[]
  today: DayLog
  saveToday: (partial: Partial<DayLog>) => void
}

const HealthContext = createContext<HealthContextValue | null>(null)

const todayIso = new Date().toISOString().slice(0, 10)

export function HealthProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<DayLog[]>(() => [
    ...SEED,
    { date: todayIso, stool: null, appetite: null, skin: null, skinAreas: [] },
  ])

  const today = useMemo(
    () => logs.find((l) => l.date === todayIso)!,
    [logs],
  )

  const saveToday = (partial: Partial<DayLog>) => {
    setLogs((prev) =>
      prev.map((l) => (l.date === todayIso ? { ...l, ...partial } : l)),
    )
  }

  const value = useMemo(
    () => ({ dog: DOG, logs, today, saveToday }),
    [logs, today],
  )

  return (
    <HealthContext.Provider value={value}>{children}</HealthContext.Provider>
  )
}

export function useHealth() {
  const ctx = useContext(HealthContext)
  if (!ctx) throw new Error('useHealth must be used within HealthProvider')
  return ctx
}
