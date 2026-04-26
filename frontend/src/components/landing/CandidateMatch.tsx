'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Star, Briefcase, GraduationCap, Zap } from 'lucide-react'

export function CandidateMatch() {
  return (
    <section className="py-24 overflow-hidden bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Candidate Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-purple-600/20 blur-[100px] rounded-full -z-10" />
            
            <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-8 shadow-2xl relative">
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    SK
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Sarah K.</h3>
                    <p className="text-slate-400">Senior Product Designer</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-400">Remote</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-400">8+ Yrs Exp</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1">Match Score</div>
                  <div className="text-4xl font-black text-purple-400">95%</div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Star size={14} className="text-yellow-500" /> Top Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Figma', 'React', 'Design Systems', 'UX Research', 'Prototyping'].map(skill => (
                      <span key={skill} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="text-sm font-bold text-white mb-2">AI Summary</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Highly experienced designer with a strong technical background in React. 
                    Previously led design teams at top-tier SaaS companies. Excellent cultural fit.
                  </p>
                </div>

                <button className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Schedule Interview
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right: Progress Bars */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
                <Zap size={12} /> AI-Powered Match
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Instant candidate <br />
                <span className="text-slate-500">verification.</span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Our AI agents analyze resumes against your job description in seconds, 
                breaking down the match into key categories so you know exactly why they fit.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { label: 'Skills Match', score: 98, icon: Briefcase, color: 'bg-purple-500' },
                { label: 'Experience Level', score: 92, icon: Star, color: 'bg-indigo-500' },
                { label: 'Education Match', score: 85, icon: GraduationCap, color: 'bg-blue-500' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm">
                      <stat.icon size={16} className="text-slate-500" />
                      {stat.label}
                    </div>
                    <div className="text-white font-bold text-sm">{stat.score}%</div>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${stat.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full ${stat.color} shadow-[0_0_10px_rgba(139,92,246,0.3)]`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
