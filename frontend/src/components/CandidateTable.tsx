'use client'

import { motion } from 'framer-motion'
import type { Candidate } from '@/lib/api'

const badgeClass: Record<string, string> = {
  QUALIFIED: 'badge-success',
  REJECTED: 'badge-error',
  NEEDS_INFO: 'badge-warning',
  NEEDS_MORE_INFO: 'badge-warning',
  INTERVIEW_READY: 'badge-primary',
  NEW: 'badge-info',
}

export function CandidateTable({ candidates }: { candidates: Candidate[] }) {
  if (!candidates.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="alert bg-base-100 shadow">
        <span>No candidates found for this filter.</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="overflow-x-auto bg-base-100 rounded-box shadow-xl border border-base-300"
    >
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Score</th>
            <th>Salary</th>
            <th>Notice</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate, index) => {
            const status = candidate.status || 'NEW'
            return (
              <motion.tr
                key={candidate.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
              >
                <td>
                  <div className="font-semibold">{candidate.name || 'Unnamed candidate'}</div>
                  <div className="text-xs opacity-60">{candidate.email}</div>
                </td>
                <td>
                  <span className={`badge ${badgeClass[status] || 'badge-outline'}`}>{status}</span>
                </td>
                <td>{candidate.score ?? '-'}</td>
                <td>{candidate.expected_salary || '-'}</td>
                <td>{candidate.notice_period || '-'}</td>
                <td className="max-w-md truncate">{candidate.summary || 'No summary yet'}</td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </motion.div>
  )
}
