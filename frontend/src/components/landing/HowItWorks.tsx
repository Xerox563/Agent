'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { 
  Mail, 
  FileSearch, 
  Database, 
  Brain, 
  CheckCircle2, 
  UserPlus 
} from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const steps = [
  { title: 'Email Ingestion', icon: Mail, desc: 'Listen to inbox & fetch applications' },
  { title: 'Resume Parsing', icon: FileSearch, desc: 'Extract text from PDF/DOCX' },
  { title: 'Data Extraction', icon: Database, desc: 'Structure info with AI' },
  { title: 'AI Scoring', icon: Brain, desc: 'Analyze match & classify' },
  { title: 'Screening', icon: CheckCircle2, desc: 'Automated follow-ups' },
  { title: 'Hiring', icon: UserPlus, desc: 'Final interview & offer' },
]

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1,
        }
      })

      tl.fromTo(
        lineRef.current,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 1, ease: 'none' }
      )

      gsap.utils.toArray('.step-card').forEach((card: any, i: number) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
          opacity: 0,
          y: 30,
          duration: 0.6,
          delay: i * 0.1
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} id="how-it-works" className="py-24 bg-black/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">The Recruitment Pipeline</h2>
          <p className="text-slate-400">Our AI agents handle the entire flow from first touch to hire.</p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div 
            ref={lineRef}
            className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/20 via-purple-500 to-indigo-500/20 -translate-y-1/2 z-0"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 relative z-10">
            {steps.map((step, i) => (
              <div key={step.title} className="step-card flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#0A0A0B] border border-white/10 flex items-center justify-center mb-6 shadow-xl group hover:border-purple-500/50 transition-colors">
                  <step.icon className="text-purple-400 group-hover:scale-110 transition-transform" size={28} />
                </div>
                <h3 className="text-white font-bold mb-2 text-sm">{step.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[150px]">{step.desc}</p>
                
                {/* Mobile/Tablet Arrow */}
                {i < steps.length - 1 && (
                  <div className="lg:hidden my-4 text-purple-500/30">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
