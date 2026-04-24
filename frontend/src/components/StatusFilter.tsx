'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const options = ['ALL', 'NEW', 'QUALIFIED', 'REJECTED']

export function StatusFilter({ current }: { current: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="tabs tabs-boxed bg-base-100 w-fit"
    >
      {options.map((option) => (
        <Link
          key={option}
          href={option === 'ALL' ? '/dashboard' : `/dashboard?status=${option}`}
          className={`tab ${current === option ? 'tab-active' : ''}`}
        >
          {option}
        </Link>
      ))}
    </motion.div>
  )
}
