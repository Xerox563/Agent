'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const features = [
  {
    title: 'Smart Email Ingestion',
    text: 'Reads unread candidate emails, extracts details, and stores everything in Supabase.',
  },
  {
    title: 'AI Candidate Screening',
    text: 'Classifies candidates into qualified, rejected, or needs more info with score and summary.',
  },
  {
    title: 'Automated Follow-ups',
    text: 'Sends screening emails, reminders, and interview slot options without manual effort.',
  },
]

export function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      <div className="navbar max-w-7xl mx-auto px-6">
        <div className="flex-1">
          <span className="text-xl font-bold">Recruiting AI Agent</span>
        </div>
        <div className="flex-none">
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            Open Dashboard
          </Link>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <span className="badge badge-primary badge-outline">Production MVP</span>
          <h1 className="text-5xl font-black leading-tight">
            Hire faster with an
            <span className="text-primary"> AI-powered </span>
            recruiting workflow
          </h1>
          <p className="text-base-content/70 text-lg">
            Automated email ingestion, resume parsing, candidate scoring, and scheduling in one clean system.
          </p>
          <div className="flex gap-3">
            <Link href="/dashboard" className="btn btn-primary">
              View Dashboard
            </Link>
            <a href="#features" className="btn btn-ghost">
              Explore Features
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card bg-base-100 shadow-2xl border border-base-300"
        >
          <div className="card-body">
            <h2 className="card-title">Pipeline Snapshot</h2>
            <ul className="steps steps-vertical lg:steps-horizontal w-full mt-4">
              <li className="step step-primary">Ingest Emails</li>
              <li className="step step-primary">Parse Resume</li>
              <li className="step step-primary">Classify</li>
              <li className="step step-primary">Follow-up</li>
            </ul>
            <div className="stats bg-base-200 mt-6">
              <div className="stat">
                <div className="stat-title">Automation</div>
                <div className="stat-value text-primary">24/7</div>
              </div>
              <div className="stat">
                <div className="stat-title">Stack</div>
                <div className="stat-value text-secondary">FastAPI</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card bg-base-100 shadow-lg border border-base-300"
            >
              <div className="card-body">
                <h3 className="card-title">{item.title}</h3>
                <p className="text-base-content/70">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  )
}
