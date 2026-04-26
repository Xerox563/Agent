'use client'

import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  BarChart3, 
  Zap, 
  ShieldCheck,
  BrainCircuit
} from 'lucide-react'

const features = [
  {
    title: 'AI Sourcing',
    description: 'Automatically discover and ingest candidates from your inbox and job boards.',
    icon: Search,
    color: 'from-blue-500 to-cyan-400'
  },
  {
    title: 'AI Screening',
    description: 'Intelligent resume parsing and scoring based on your specific job requirements.',
    icon: BrainCircuit,
    color: 'from-purple-500 to-indigo-500'
  },
  {
    title: 'AI Engagement',
    description: 'Personalized automated follow-ups that keep candidates warm and informed.',
    icon: Mail,
    color: 'from-pink-500 to-rose-500'
  },
  {
    title: 'AI Scheduling',
    description: 'Coordinate interviews without the back-and-forth using smart slot management.',
    icon: Calendar,
    color: 'from-orange-500 to-amber-500'
  },
  {
    title: 'AI Insights',
    description: 'Deep analytics on your hiring funnel to identify bottlenecks and improve quality.',
    icon: BarChart3,
    color: 'from-green-500 to-emerald-500'
  }
]

export function FeatureGrid() {
  return (
    <section id="product" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            Built for the future of hiring
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 max-w-2xl mx-auto"
          >
            Our platform combines powerful AI agents with a beautiful, intuitive interface 
            to streamline every step of your recruiting process.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform`}>
                <feature.icon className="text-white" size={24} />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {feature.description}
              </p>

              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}

          {/* Special "Coming Soon" or CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="p-8 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 flex flex-col justify-center items-center text-center shadow-xl shadow-purple-900/20"
          >
            <Zap className="text-white mb-4 animate-pulse" size={40} />
            <h3 className="text-xl font-bold text-white mb-2">Ready to start?</h3>
            <p className="text-white/80 text-sm mb-6">Join 500+ teams hiring with RecruitAI</p>
            <button className="px-6 py-2 bg-white text-purple-700 font-bold rounded-full text-sm hover:scale-105 transition-transform">
              Get Started
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
