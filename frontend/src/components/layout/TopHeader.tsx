import { Bell, CalendarDays, Search } from 'lucide-react'

type TopHeaderProps = {
  title: string
  subtitle: string
}

export function TopHeader({ title, subtitle }: TopHeaderProps) {
  return (
    <header className="glass-card rounded-3xl p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-2 text-slate-300 transition hover:border-violet-400/60 hover:text-violet-200">
            <Bell size={16} />
          </button>
          <button className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-2 text-slate-300 transition hover:border-violet-400/60 hover:text-violet-200">
            <Search size={16} />
          </button>
          <button className="rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-sm text-slate-200">All Jobs</button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-sm text-slate-200">
            <CalendarDays size={16} />
            May 1 - May 31, 2025
          </button>
        </div>
      </div>
    </header>
  )
}
