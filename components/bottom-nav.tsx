'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, Sun, LineChart, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/', label: 'Today', icon: Home },
  { href: '/walk', label: 'Walk', icon: Sun },
  { href: '/log', label: 'Log', icon: PlusCircle, primary: true },
  { href: '/history', label: 'Trends', icon: LineChart },
  { href: '/partner', label: 'Partner', icon: Users },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md md:max-w-lg">
      <div className="mx-3 mb-3 flex items-center justify-between rounded-2xl border border-border bg-card/85 px-2 py-2 backdrop-blur-xl">
        {ITEMS.map(({ href, label, icon: Icon, primary }) => {
          const active = pathname === href
          if (primary) {
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className="flex flex-col items-center"
              >
                <span
                  className={cn(
                    'flex size-12 -translate-y-1 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-95',
                  )}
                >
                  <Icon className="size-6" strokeWidth={2} />
                </span>
              </Link>
            )
          }
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-1.5 text-[10px] font-medium tracking-wide transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
