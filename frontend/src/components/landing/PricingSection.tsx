'use client'

import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import { useState } from 'react'

const tiers = [
  {
    name: 'Starter',
    price: { monthly: '$49', yearly: '$39' },
    description: 'Perfect for small teams and startups.',
    features: [
      'Up to 50 candidates/mo',
      'Basic AI parsing',
      'Email integration',
      'Standard support'
    ],
    cta: 'Start Free Trial',
    highlight: false
  },
  {
    name: 'Professional',
    price: { monthly: '$149', yearly: '$119' },
    description: 'Advanced features for growing companies.',
    features: [
      'Unlimited candidates',
      'Advanced AI scoring',
      'Automated scheduling',
      'Custom follow-up flows',
      'Priority support'
    ],
    cta: 'Get Started',
    highlight: true
  },
  {
    name: 'Enterprise',
    price: { monthly: 'Custom', yearly: 'Custom' },
    description: 'Full power for large organizations.',
    features: [
      'Multiple team seats',
      'Custom AI training',
      'API access',
      'Dedicated account manager',
      'SSO & Advanced security'
    ],
    cta: 'Contact Sales',
    highlight: false
  }
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Simple, transparent pricing</h2>
          
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm ${!isYearly ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-12 h-6 rounded-full bg-purple-600/20 border border-purple-500/30 relative transition-colors"
            >
              <motion.div 
                animate={{ x: isYearly ? 24 : 2 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-purple-500"
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-white' : 'text-slate-500'}`}>Yearly (Save 20%)</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-3xl border ${
                tier.highlight 
                  ? 'bg-white/5 border-purple-500 shadow-[0_0_40px_rgba(139,92,246,0.1)]' 
                  : 'bg-black/40 border-white/10'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-slate-500 text-sm">{tier.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-black text-white">
                  {isYearly ? tier.price.yearly : tier.price.monthly}
                </span>
                {tier.price.monthly !== 'Custom' && (
                  <span className="text-slate-500 text-sm ml-2">/month</span>
                )}
              </div>

              <div className="space-y-4 mb-10">
                {tier.features.map(feature => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Check size={12} className="text-purple-500" />
                    </div>
                    <span className="text-slate-400 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-4 rounded-xl font-bold transition-all active:scale-95 ${
                tier.highlight 
                  ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20' 
                  : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
              }`}>
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
