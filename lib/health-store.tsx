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

/* --------------------- Real Walk Safety (OpenMeteo API) ---------------------- */

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
  lastUpdated?: string
}

// Cache for weather data (5 minute TTL)
let weatherCache: { data: WalkSafety; timestamp: number } | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Map direct solar radiation (W/m²) to an approximate sun elevation angle
function radiationToSunElevation(radiation: number): number {
  const ratio = Math.max(0, Math.min(1, radiation / 1000))
  return Math.max(0, Math.min(90, Math.round(Math.asin(ratio) * (180 / Math.PI))))
}

// Fetch real weather from OpenMeteo API
async function fetchRealWeather(): Promise<{
  tempF: number
  humidity: number
  uv: number
  feelsLikeF: number
  sunElevation: number
} | null> {
  try {
    // Los Angeles coordinates
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=34.0522&longitude=-118.2437&current=temperature_2m,relative_humidity_2m,apparent_temperature,uv_index,direct_radiation&temperature_unit=fahrenheit&timezone=America/Los_Angeles'
    )
    const data = await response.json()

    if (data.current) {
      return {
        tempF: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m,
        uv: Math.round(data.current.uv_index),
        feelsLikeF: Math.round(data.current.apparent_temperature),
        sunElevation: radiationToSunElevation(data.current.direct_radiation),
      }
    }
  } catch (error) {
    console.error('Weather API error:', error)
  }
  return null
}

export async function computeWalkSafety(now = new Date()): Promise<WalkSafety> {
  // Check cache first (5 minute cache)
  if (weatherCache && Date.now() - weatherCache.timestamp < CACHE_TTL) {
    return weatherCache.data
  }

  // Fetch real weather
  const weather = await fetchRealWeather()
  
  // Fallback to simulated if API fails
  const hour = now.getHours() + now.getMinutes() / 60
  const simSunElevation = Math.max(0, Math.round(68 * Math.sin((Math.PI * (hour - 6)) / 14)))
  const simTemp = Math.round(62 + 22 * Math.sin((Math.PI * (hour - 5)) / 16))
  
  const tempF = weather?.tempF ?? simTemp
  const humidity = weather?.humidity ?? 65
  const feelsLikeF = weather?.feelsLikeF ?? tempF
  const uv = weather?.uv ?? 5

  const sunElevation = weather?.sunElevation ?? simSunElevation
  
  // Pavement is much hotter than air under direct sun
  // Formula: pavement_temp ≈ air_temp + (sun_elevation * 0.6)
  const pavementF = Math.round(tempF + sunElevation * 0.6)

  let status: WalkSafety['status'] = 'safe'
  let headline = 'Great conditions for a walk'

  // Frenchie heat safety: brachycephalic breeds overheat easily
  if (pavementF >= 125 || tempF >= 85) {
    status = 'danger'
    headline = "Too hot — skip the walk"
  } else if (pavementF >= 115 || tempF >= 78) {
    status = 'caution'
    headline = 'Risky — keep it very short'
  }

  const bestWindow = (() => {
    if (sunElevation < 20) return 'Now is good'
    if (sunElevation < 40) return 'Afternoon is better'
    return 'Wait until late afternoon'
  })()

  const result: WalkSafety = {
    status,
    headline,
    tempF,
    feelsLikeF,
    humidity,
    uv,
    pavementF,
    sunElevation,
    bestWindow,
    lastUpdated: now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
  }

  // Cache the result
  weatherCache = { data: result, timestamp: Date.now() }

  return result
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
  const [logs, setLogs] = useState<DayLog[]>(() => {
    // Load from localStorage if available, otherwise use seed data
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('frenchie_health_logs')
        if (stored) {
          return JSON.parse(stored)
        }
      } catch (e) {
        console.error('Failed to load from localStorage:', e)
      }
    }
    return [
      ...SEED,
      { date: todayIso, stool: null, appetite: null, skin: null, skinAreas: [] },
    ]
  })

  const today = useMemo(
    () => logs.find((l) => l.date === todayIso) || 
           { date: todayIso, stool: null, appetite: null, skin: null, skinAreas: [] },
    [logs],
  )

  const saveToday = (partial: Partial<DayLog>) => {
    setLogs((prev) => {
      const updated = prev.map((l) => (l.date === todayIso ? { ...l, ...partial } : l))
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('frenchie_health_logs', JSON.stringify(updated))
        } catch (e) {
          console.error('Failed to save to localStorage:', e)
        }
      }
      return updated
    })
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
