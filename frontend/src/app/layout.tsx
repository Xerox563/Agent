import './globals.css'
import type { ReactNode } from 'react'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'

export const metadata = {
  title: 'HireAgent - AI Recruiting Platform',
  description: 'Premium SaaS ATS and AI recruiting workflow dashboard',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <QueryProvider>
          <SmoothScrollProvider />
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
