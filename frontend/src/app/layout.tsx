import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Recruiting AI Agent',
  description: 'AI powered recruiting agent and dashboard',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-base-200 min-h-screen text-base-content">{children}</body>
    </html>
  )
}
