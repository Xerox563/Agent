'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export function FinalCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative p-12 md:p-20 rounded-[40px] bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-white/10 overflow-hidden text-center"
        >
          {/* Animated Glow Border */}
          <div className="absolute inset-0 -z-10 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(139,92,246,0.2)_180deg,transparent_360deg)] animate-[spin_8s_linear_infinite]" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <Zap className="text-purple-400 mx-auto mb-6 animate-pulse" size={48} />
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to transform your hiring?
            </h2>
            <p className="text-lg text-slate-300 mb-10 leading-relaxed">
              Join hundreds of forward-thinking teams using RecruitAI to build their 
              dream teams 10x faster.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-10 py-5 bg-white text-black font-black rounded-full hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                Book a Demo
              </button>
              <button className="px-10 py-5 bg-transparent text-white font-black rounded-full border border-white/20 hover:bg-white/5 transition-all active:scale-95">
                View Pricing
              </button>
            </div>
          </div>
          
          {/* Decorative Orbs */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full" />
        </motion.div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="py-12 border-t border-white/5 bg-black/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">RecruitAI</span>
            </div>
            <p className="text-slate-500 max-w-xs leading-relaxed">
              Next-generation AI recruiting platform for modern teams. 
              Build with speed, precision, and intelligence.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4">
              {['Features', 'Pricing', 'API', 'Docs'].map(link => (
                <li key={link}>
                  <a href="#" className="text-slate-500 hover:text-purple-400 transition-colors text-sm">{link}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4">
              {['About', 'Careers', 'Privacy', 'Terms'].map(link => (
                <li key={link}>
                  <a href="#" className="text-slate-500 hover:text-purple-400 transition-colors text-sm">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-xs">
            © 2026 RecruitAI Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-600 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-slate-600 hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="text-slate-600 hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
