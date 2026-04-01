import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from 'sonner'
import PwaRegister from '@/components/PwaRegister'
import InstallPrompt from '@/components/InstallPrompt'
import './globals.css'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Zero Tracker',
  description: 'Suivi quotidien de ta sèche – poids, calories, pas, séances',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Zero Tracker',
  },
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={geist.variable}>
      <body>
        <PwaRegister />
        <InstallPrompt />
        {children}
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}
