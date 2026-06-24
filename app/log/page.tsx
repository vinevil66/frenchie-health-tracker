'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Droplets, Utensils, Sparkles } from 'lucide-react'
import {
  useHealth,
  STOOL_OPTIONS,
  APPETITE_OPTIONS,
  SKIN_OPTIONS,
  SKIN_AREAS,
  type StoolScore,
  type AppetiteScore,
  type SkinSeverity,
} from '@/lib/health-store'
import { cn } from '@/lib/utils'

export default function LogPage() {
  const router = useRouter()
  const { dog, today, saveToday } = useHealth()

  const [stool, setStool] = useState<StoolScore | null>(today.stool)
  const [appetite, setAppetite] = useState<AppetiteScore | null>(
    today.appetite,
  )
  const [skin, setSkin] = useState<SkinSeverity | null>(today.skin)
  const [areas, setAreas] = useState<string[]>(today.skinAreas)
  const [note, setNote] = useState(today.note ?? '')
  const [saved, setSaved] = useState(false)

  const toggleArea = (a: string) =>
    setAreas((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    )

  const handleSave = () => {
    saveToday({ stool, appetite, skin, skinAreas: areas, note })
    setSaved(true)
    setTimeout(() => router.push('/'), 650)
  }

  return (
    <div className="flex flex-col gap-8 px-5 pt-8">
      <header>
        <p className="text-sm text-muted-foreground">Daily log</p>
        <h1 className="font-serif text-3xl text-foreground">
          How is {dog.name} today?
        </h1>
      </header>

      {/* Stool */}
      <section className="flex flex-col gap-4">
        <SectionLabel icon={<Droplets className="size-4" />} title="Stool consistency" />
        <div className="grid grid-cols-1 gap-2">
          {STOOL_OPTIONS.map((o) => (
            <button
              key={o.score}
              type="button"
              onClick={() => setStool(o.score)}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                stool === o.score
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-muted-foreground/40',
              )}
            >
              <span
                className={cn(
                  'tabular flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                  o.score >= 3 && o.score <= 4
                    ? 'bg-success/20 text-success'
                    : o.score === 5 || o.score === 2
                      ? 'bg-warning/20 text-warning'
                      : 'bg-danger/20 text-danger',
                )}
              >
                {o.score}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{o.label}</p>
                <p className="text-xs text-muted-foreground">{o.desc}</p>
              </div>
              {stool === o.score && <Check className="size-4 text-primary" />}
            </button>
          ))}
        </div>
      </section>

      {/* Appetite */}
      <section className="flex flex-col gap-4">
        <SectionLabel icon={<Utensils className="size-4" />} title="Appetite" />
        <div className="grid grid-cols-2 gap-2">
          {APPETITE_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setAppetite(o.value)}
              className={cn(
                'flex flex-col gap-0.5 rounded-xl border px-4 py-3 text-left transition-colors',
                appetite === o.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-muted-foreground/40',
              )}
            >
              <span className="text-sm font-medium text-foreground">
                {o.label}
              </span>
              <span className="text-xs text-muted-foreground">{o.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Skin */}
      <section className="flex flex-col gap-4">
        <SectionLabel icon={<Sparkles className="size-4" />} title="Skin & coat" />
        <div className="grid grid-cols-3 gap-2">
          {SKIN_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setSkin(o.value)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-colors',
                skin === o.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-muted-foreground/40',
              )}
            >
              <span className="text-sm font-medium text-foreground">
                {o.label}
              </span>
              <span className="text-[11px] leading-tight text-muted-foreground">
                {o.desc}
              </span>
            </button>
          ))}
        </div>

        {skin && skin !== 'clear' && (
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Affected areas
            </p>
            <div className="flex flex-wrap gap-2">
              {SKIN_AREAS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleArea(a)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs transition-colors',
                    areas.includes(a)
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground',
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Note */}
      <section className="flex flex-col gap-3">
        <SectionLabel title="Note (optional)" />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Anything worth remembering — new treat, vet visit, scratching at night…"
          className="resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
        />
      </section>

      <button
        type="button"
        onClick={handleSave}
        className={cn(
          'sticky bottom-24 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all active:scale-[0.98]',
          saved
            ? 'bg-success text-background'
            : 'bg-primary text-primary-foreground',
        )}
      >
        {saved ? (
          <>
            <Check className="size-4" /> Saved
          </>
        ) : (
          'Save today'
        )}
      </button>
    </div>
  )
}

function SectionLabel({
  icon,
  title,
}: {
  icon?: React.ReactNode
  title: string
}) {
  return (
    <div className="flex items-center gap-2 text-foreground">
      {icon && <span className="text-primary">{icon}</span>}
      <h2 className="text-sm font-semibold">{title}</h2>
    </div>
  )
}
