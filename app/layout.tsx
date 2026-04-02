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
  title: 'Hobart Auto Removal — Quick Cash For Cars with Free Car Removal',
  description:
    'Get cash for your unwanted car in Hobart. Free car removal, same-day pickup, instant payment. We buy all makes, models, and conditions. Call 0419 331 319 for a quote.',
  keywords: 'cash for cars Hobart, car removal Hobart, car wreckers, scrap car removal Tasmania, instant car removal',
  openGraph: {
    title: 'Hobart Auto Removal — Quick Cash For Cars with Free Car Removal',
    description: 'Get quick cash for unwanted cars in Hobart. Free pickup, same-day removal, instant payment for all vehicle conditions.',
    locale: 'en_AU',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-AU">
      <body className={`${inter.variable} ${dmSerif.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
