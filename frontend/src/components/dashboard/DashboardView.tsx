'use client'

import { motion } from 'framer-motion'

import type { Candidate } from '@/lib/api'
import { CandidateTable } from '@/components/CandidateTable'
import { StatusFilter } from '@/components/StatusFilter'

export function DashboardView({ candidates, status }: { candidates: Candidate[]; status: string }) {
  const qualified = candidates.filter((candidate) => candidate.status === 'QUALIFIED').length
  const rejected = candidates.filter((candidate) => candidate.status === 'REJECTED').length
  const needsInfo = candidates.filter((candidate) => candidate.status === 'NEEDS_INFO').length

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="hero bg-base-100 rounded-2xl shadow border border-base-300"
      >
        <div className="hero-content w-full justify-between flex-col lg:flex-row">
          <div>
            <h1 className="text-3xl font-black">Recruiting Dashboard</h1>
            <p className="opacity-70">Track candidate pipeline, screening details, and scoring in real time.</p>
          </div>
          <StatusFilter current={status} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06 }}
        className="grid md:grid-cols-4 gap-4"
      >
        <div className="stat bg-base-100 rounded-xl shadow border border-base-300">
          <div className="stat-title">Total</div>
          <div className="stat-value text-primary">{candidates.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow border border-base-300">
          <div className="stat-title">Qualified</div>
          <div className="stat-value text-success">{qualified}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow border border-base-300">
          <div className="stat-title">Rejected</div>
          <div className="stat-value text-error">{rejected}</div>
        </div>
        <div className="stat bg-base-100 rounded-xl shadow border border-base-300">
          <div className="stat-title">Needs Info</div>
          <div className="stat-value text-warning">{needsInfo}</div>
        </div>
      </motion.div>

      <CandidateTable candidates={candidates} />
    </main>
  )
}
