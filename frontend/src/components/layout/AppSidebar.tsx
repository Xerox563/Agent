'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Briefcase, ChartSpline, Gauge, Mail, Puzzle, Settings, Sparkles, UserRoundSearch, Users, Workflow } from 'lucide-react'

import { cn } from '@/lib/utils'
import { navItems } from '@/lib/mock-data'

const iconMap = [Gauge, Users, Mail, ChartSpline, Briefcase, Workflow, Sparkles, Puzzle, Settings]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="glass-card hidden w-72 shrink-0 flex-col rounded-3xl p-5 xl:flex">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-violet-500/20 p-2 text-violet-300">
          <UserRoundSearch size={20} />
        </div>
        <div>
          <p className="font-semibold text-slate-100">HireAgent</p>
          <p className="text-xs text-slate-400">AI Recruiting Suite</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item, index) => {
          const Icon = iconMap[index]
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative overflow-hidden rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:text-white',
                active && 'text-white',
              )}
            >
              {active ? (
                <motion.span
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-2xl bg-violet-500/25 ring-1 ring-violet-300/40"
                  transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                />
              ) : null}
              <span className="relative flex items-center gap-3">
                <Icon size={16} />
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="glass-card mt-4 rounded-2xl p-4">
        <p className="text-sm font-medium text-slate-100">Sarah Johnson</p>
        <p className="text-xs text-slate-400">HR Manager</p>
      </div>
    </aside>
  )
}
