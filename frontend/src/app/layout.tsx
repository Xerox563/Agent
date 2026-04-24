import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Recruiting Agent Dashboard',
  description: 'AI powered recruiting dashboard',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-base-200 min-h-screen">{children}</body>
    </html>
  )
}
