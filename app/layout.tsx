import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import './globals.css'
import { HealthProvider } from '@/lib/health-store'
import { BottomNav } from '@/components/bottom-nav'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  title: 'Frenchie Health Tracker',
  description:
    'A premium daily health journal for your French Bulldog — appetite, digestion, skin, and real-time walk safety.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0a08',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <HealthProvider>
          <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background md:max-w-lg">
            <main className="flex-1 pb-24">{children}</main>
            <BottomNav />
          </div>
        </HealthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
