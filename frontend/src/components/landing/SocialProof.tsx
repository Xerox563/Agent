'use client'

import { motion } from 'framer-motion'

const logos = [
  'Vercel', 'Stripe', 'Linear', 'Supabase', 'Framer', 'GitHub', 'Slack', 'Discord'
]

export function SocialProof() {
  return (
    <section className="py-20 border-y border-white/5 bg-black/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mb-12">
          Empowering recruitment at world-class teams
        </p>
        
        <div className="relative">
          {/* Marquee effect */}
          <div className="flex gap-16 md:gap-32 animate-marquee whitespace-nowrap">
            {[...logos, ...logos].map((logo, i) => (
              <span 
                key={i} 
                className="text-2xl md:text-3xl font-black text-slate-700 hover:text-slate-400 transition-colors cursor-default"
              >
                {logo}
              </span>
            ))}
          </div>
          
          {/* Fades */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  )
}
