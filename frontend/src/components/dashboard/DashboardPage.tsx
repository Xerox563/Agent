'use client'

import { useEffect, useState } from 'react'
import CountUp from 'react-countup'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import gsap from 'gsap'
import Lottie from 'lottie-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { PageScaffold } from '@/components/layout/PageScaffold'
import {
  fetchDashboardActivity,
  fetchDashboardPipeline,
  fetchDashboardRecentCandidates,
  fetchDashboardSkills,
  fetchDashboardSummary,
  fetchDashboardTrends,
} from '@/lib/api'

import successPulse from '@/lib/lottie/success-pulse.json'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }

export function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const summaryQuery = useQuery({ queryKey: ['dashboard-summary'], queryFn: fetchDashboardSummary })
  const pipelineQuery = useQuery({ queryKey: ['dashboard-pipeline'], queryFn: fetchDashboardPipeline })
  const trendsQuery = useQuery({ queryKey: ['dashboard-trends'], queryFn: fetchDashboardTrends })
  const skillsQuery = useQuery({ queryKey: ['dashboard-skills'], queryFn: fetchDashboardSkills })
  const recentCandidatesQuery = useQuery({ queryKey: ['dashboard-recent-candidates'], queryFn: fetchDashboardRecentCandidates })
  const activityQuery = useQuery({ queryKey: ['dashboard-activity'], queryFn: fetchDashboardActivity })

  useEffect(() => {
    setMounted(true)
    gsap.fromTo(
      '.kpi-card',
      { boxShadow: '0 0 0 rgba(124,58,237,0)' },
      { boxShadow: '0 0 40px rgba(124,58,237,0.18)', duration: 1.2, stagger: 0.06, ease: 'power2.out' },
    )
  }, [])

  const summary = summaryQuery.data
  const kpiCards = summary
    ? [
        { title: 'Total Candidates', value: summary.total_candidates, tone: 'text-violet-300' },
        { title: 'Qualified', value: summary.qualified, tone: 'text-emerald-300' },
        { title: 'Rejected', value: summary.rejected, tone: 'text-rose-300' },
        { title: 'Needs Info', value: summary.needs_info, tone: 'text-amber-300' },
        { title: 'Avg. Score', value: summary.avg_score, tone: 'text-indigo-300' },
      ]
    : []
  const kpiCardsToRender: Array<{ title: string; value: number; tone: string }> = summaryQuery.isLoading
    ? []
    : kpiCards

  return (
    <PageScaffold title="Recruiting Dashboard" subtitle="Track candidate pipeline, screening details, and scoring in real time.">
      {summaryQuery.isError ? <div className="glass-card rounded-2xl p-4 text-sm text-rose-300">Failed to load dashboard summary from backend.</div> : null}
      <motion.section variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summaryQuery.isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <motion.div key={`kpi-skeleton-${index}`} variants={item} className="glass-card kpi-card rounded-3xl p-5 transition duration-300 hover:-translate-y-1">
                <div className="h-20 animate-pulse rounded-xl bg-slate-800/60" />
              </motion.div>
            ))
          : kpiCardsToRender.map((kpi) => (
              <motion.div key={kpi.title} variants={item} className="glass-card kpi-card rounded-3xl p-5 transition duration-300 hover:-translate-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-400">{kpi.title}</p>
                <p className={`mt-3 text-3xl font-semibold ${kpi.tone}`}>
                  <CountUp end={Number(kpi.value)} duration={1.3} />
                </p>
                <p className="mt-2 text-xs text-slate-400">Live backend metric</p>
              </motion.div>
            ))}
      </motion.section>

      <motion.section variants={container} initial="hidden" animate="show" className="mt-4 grid gap-4 xl:grid-cols-12">
        <motion.div variants={item} className="glass-card rounded-3xl p-5 xl:col-span-4">
          <h3 className="text-sm font-medium text-slate-100">Pipeline Overview</h3>
          <div className="mt-5 space-y-3">
            {(pipelineQuery.data ?? []).map((stage, idx) => (
              <motion.div key={stage.stage} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }}>
                <div className="mb-1 flex justify-between text-xs text-slate-300">
                  <span>{stage.stage}</span>
                  <span>{stage.value}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${(stage.value / Math.max(1, (pipelineQuery.data ?? [])[0]?.value ?? 1)) * 100}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
            {pipelineQuery.isLoading ? <div className="h-24 animate-pulse rounded-xl bg-slate-800/60" /> : null}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card rounded-3xl p-5 xl:col-span-5">
          <h3 className="text-sm font-medium text-slate-100">Candidates Over Time</h3>
          <div className="mt-4 h-56">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendsQuery.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                  <Area dataKey="received" type="monotone" stroke="#8b5cf6" fill="#8b5cf633" />
                  <Area dataKey="qualified" type="monotone" stroke="#22d3ee" fill="#22d3ee22" />
                  <Area dataKey="rejected" type="monotone" stroke="#f43f5e" fill="#f43f5e22" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-2xl border border-slate-700/50 bg-slate-900/40" />
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-card rounded-3xl p-5 xl:col-span-3">
          <h3 className="text-sm font-medium text-slate-100">Top Skills</h3>
          <div className="mt-5 space-y-4">
            {(skillsQuery.data ?? []).map((skill, idx) => (
              <div key={skill.skill}>
                <div className="mb-1 flex justify-between text-xs text-slate-300">
                  <span>{skill.skill}</span>
                  <span>{skill.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, skill.count)}%` }}
                    transition={{ duration: 0.9, delay: idx * 0.1 }}
                  />
                </div>
              </div>
            ))}
            {skillsQuery.isLoading ? <div className="h-24 animate-pulse rounded-xl bg-slate-800/60" /> : null}
          </div>
        </motion.div>
      </motion.section>

      <motion.section variants={container} initial="hidden" animate="show" className="mt-4 grid gap-4 xl:grid-cols-12">
        <motion.div variants={item} className="glass-card rounded-3xl p-5 xl:col-span-8">
          <h3 className="text-sm font-medium text-slate-100">Recent Candidates</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Candidate</th>
                  <th className="py-2">Position</th>
                  <th className="py-2">Score</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Source</th>
                  <th className="py-2">Received</th>
                </tr>
              </thead>
              <tbody>
                {(recentCandidatesQuery.data ?? []).map((candidate, idx) => (
                  <motion.tr key={candidate.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="border-t border-slate-700/50 hover:bg-slate-900/40">
                    <td className="py-3">{candidate.name ?? candidate.email}</td>
                    <td>{candidate.role}</td>
                    <td>{candidate.score}</td>
                    <td>
                      <span className="rounded-full border border-violet-300/40 bg-violet-500/15 px-2 py-1 text-xs text-violet-200">{candidate.status ?? 'NEW'}</span>
                    </td>
                    <td>{candidate.source ?? 'Email'}</td>
                    <td>{candidate.created_at ? new Date(candidate.created_at).toLocaleString() : 'N/A'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {recentCandidatesQuery.isLoading ? <div className="mt-3 h-24 animate-pulse rounded-xl bg-slate-800/60" /> : null}
          </div>
        </motion.div>
        <motion.div variants={item} className="glass-card rounded-3xl p-5 xl:col-span-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-100">Activity Feed</h3>
            <span className="text-xs text-violet-300">View all</span>
          </div>
          <div className="space-y-3">
            {(activityQuery.data ?? []).map((activity) => (
              <div key={activity.id ?? activity.message} className="rounded-xl border border-slate-700/50 bg-slate-900/45 p-3 text-sm text-slate-300">
                <p>{activity.message}</p>
                <p className="mt-1 text-xs text-slate-500">{activity.created_at ? new Date(activity.created_at).toLocaleString() : 'Live'}</p>
              </div>
            ))}
            {activityQuery.isLoading ? <div className="h-24 animate-pulse rounded-xl bg-slate-800/60" /> : null}
          </div>
          <div className="mx-auto mt-5 h-24 w-24">
            <Lottie animationData={successPulse} loop />
          </div>
        </motion.div>
      </motion.section>
    </PageScaffold>
  )
}
