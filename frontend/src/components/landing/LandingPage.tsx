'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { Navbar } from './Navbar'
import { Hero } from './Hero'
import { FeatureGrid } from './FeatureGrid'
import { HowItWorks } from './HowItWorks'
import { CandidateMatch } from './CandidateMatch'
import { SocialProof } from './SocialProof'
import { StatsSection } from './StatsSection'
import { PricingSection } from './PricingSection'
import { FinalCTA, Footer } from './Footer'

export function LandingPage() {
  useEffect(() => {
    // Initialize smooth scroll
    const lenis = new Lenis()
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  return (
    <main className="min-h-screen bg-[#020203] text-white selection:bg-purple-500/30">
      <Navbar />
      
      <div className="relative">
        <Hero />
        <SocialProof />
        <FeatureGrid />
        <HowItWorks />
        <CandidateMatch />
        <StatsSection />
        <PricingSection />
        <FinalCTA />
      </div>

      <Footer />
      
      {/* Global Background Noise/Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999]">
        <svg width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>
    </main>
  )
}
