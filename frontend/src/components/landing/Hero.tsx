'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from 'recharts'

const chartData = [
  { name: 'Mon', value: 40 },
  { name: 'Tue', value: 30 },
  { name: 'Wed', value: 60 },
  { name: 'Thu', value: 45 },
  { name: 'Fri', value: 70 },
  { name: 'Sat', value: 55 },
  { name: 'Sun', value: 85 },
]

export function Hero() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.floating-card', {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        stagger: 0.2
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-600/10 blur-[100px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Next-Gen AI Recruiting
          </motion.div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
            Hire exceptional talent, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
              10x faster with AI
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
            Automate your entire hiring funnel from email ingestion to interview scheduling. 
            Let our AI agents handle the heavy lifting while you focus on the best candidates.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-all active:scale-95">
              Book a Demo
            </button>
            <button className="px-8 py-4 bg-slate-900 text-white font-bold rounded-full border border-white/10 hover:bg-slate-800 transition-all active:scale-95">
              Start Free Trial
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-6">Trusted by innovators</p>
            <div className="flex flex-wrap gap-8 opacity-30 grayscale contrast-125">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/1280px-Microsoft_logo_%282012%29.svg.png" className="h-5" alt="Microsoft" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/LinkedIn_Logo.svg/1280px-LinkedIn_Logo.svg.png" className="h-5" alt="LinkedIn" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png" className="h-5" alt="Google" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png" className="h-5" alt="Amazon" />
            </div>
          </div>
        </motion.div>

        {/* Right Content - Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative"
        >
          {/* Main Dashboard Card */}
          <div className="bg-[#0A0A0B] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative z-10">
            <div className="h-10 border-b border-white/10 bg-white/5 flex items-center px-4 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-white font-bold">Candidate Pipeline</h3>
                  <p className="text-xs text-slate-500">Overview for Q2 Hiring</p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-400">
                  Last 30 Days
                </div>
              </div>

              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8b5cf6" 
                      strokeWidth={3} 
                      dot={false}
                    />
                    <XAxis hide dataKey="name" />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)' }}
                      itemStyle={{ color: '#8b5cf6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-slate-500 mb-1">Total Candidates</p>
                  <p className="text-xl font-bold text-white">1,284</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-slate-500 mb-1">Interviews</p>
                  <p className="text-xl font-bold text-white">142</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-slate-500 mb-1">Hires</p>
                  <p className="text-xl font-bold text-white">38</p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Cards */}
          <div className="floating-card absolute -top-10 -right-6 z-20 w-48 p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">JD</div>
              <div>
                <p className="text-[10px] font-bold text-white">John Doe</p>
                <p className="text-[8px] text-slate-500">Senior React Engineer</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-[8px] text-slate-400">Match Score</div>
              <div className="text-[10px] font-bold text-green-400">98%</div>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full mt-1 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '98%' }}
                transition={{ duration: 1, delay: 1 }}
                className="bg-green-400 h-full" 
              />
            </div>
          </div>

          <div className="floating-card absolute -bottom-8 -left-10 z-20 w-56 p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
            <p className="text-[10px] font-bold text-white mb-3">AI Sourcing Activity</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <p className="text-[9px] text-slate-300">Fetched 12 new resumes from Gmail</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <p className="text-[9px] text-slate-300">Parsed profiles with 95% accuracy</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <p className="text-[9px] text-slate-300">Sent screening emails to 5 candidates</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
