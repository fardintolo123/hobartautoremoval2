import type { Metadata } from 'next'
import { Inter, DM_Serif_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif',
})

export const metadata: Metadata = {
  title: 'HomePainters.co.nz — Precise Painting Estimates in 60 Seconds',
  description:
    'Auckland\'s most precise residential painters. Get an AI-powered estimate instantly. Led by Liam \'The Detail\' Walsh. Fixed-price quotes, 5-year no-peel warranty.',
  keywords: 'house painters Auckland, interior painting NZ, exterior painting Auckland, painting estimate, HomePainters',
  openGraph: {
    title: 'HomePainters.co.nz — Precise Painting Estimates in 60 Seconds',
    description: 'Auckland\'s most precise residential painters. AI-powered estimates, fixed-price quotes, 5-year warranty.',
    locale: 'en_NZ',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-NZ">
      <body className={`${inter.variable} ${dmSerif.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
