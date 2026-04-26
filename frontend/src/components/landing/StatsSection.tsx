'use client'

import { motion } from 'framer-motion'
import CountUp from 'react-countup'

const stats = [
  { label: 'Active Teams', value: 5000, suffix: '+' },
  { label: 'Candidates Parsed', value: 1.5, suffix: 'M' },
  { label: 'Faster Hiring', value: 60, suffix: '%' },
  { label: 'Quality Increase', value: 3, suffix: 'x' },
]

export function StatsSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-6xl font-black text-white mb-2">
                <CountUp 
                  end={stat.value} 
                  duration={2.5} 
                  decimals={stat.value % 1 !== 0 ? 1 : 0}
                  enableScrollSpy
                  scrollSpyOnce
                />
                <span className="text-purple-500">{stat.suffix}</span>
              </div>
              <div className="text-sm md:text-base text-slate-500 font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
