'use client'

import { useQuery } from '@tanstack/react-query'

import { PageScaffold } from '@/components/layout/PageScaffold'
import { fetchCandidate } from '@/lib/api'

export default function CandidateProfilePage({ params }: { params: { id: string } }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['candidate', params.id],
    queryFn: () => fetchCandidate(params.id),
  })

  if (isLoading) {
    return (
      <PageScaffold title="Candidate Profile" subtitle="Loading profile from backend...">
        <section className="grid gap-4 xl:grid-cols-12">
          <div className="glass-card h-48 animate-pulse rounded-3xl xl:col-span-8" />
          <div className="glass-card h-48 animate-pulse rounded-3xl xl:col-span-4" />
        </section>
      </PageScaffold>
    )
  }

  if (isError || !data) {
    return (
      <PageScaffold title="Candidate Profile" subtitle="Unable to load candidate profile.">
        <section className="glass-card rounded-3xl p-5 text-sm text-rose-300">Could not load candidate from backend. Please check API and candidate ID.</section>
      </PageScaffold>
    )
  }

  const skills = Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills ?? 'Not available')

  return (
    <PageScaffold title="Candidate Profile" subtitle="Deep AI profile with resume intelligence and communication timeline.">
      <section className="grid gap-4 xl:grid-cols-12">
        <article className="glass-card rounded-3xl p-5 xl:col-span-8">
          <h2 className="text-xl font-semibold text-slate-100">{data.name ?? data.email}</h2>
          <p className="mt-2 text-sm text-slate-400">{data.summary ?? 'Candidate summary will appear once AI processing is complete.'}</p>
          <div className="mt-4 rounded-2xl border border-slate-700/60 bg-slate-900/55 p-4 text-sm text-slate-300">
            Role: {data.role ?? 'Unknown'} | Source: {data.source ?? 'Unknown'} | Skills: {skills}
          </div>
        </article>
        <article className="glass-card rounded-3xl p-5 xl:col-span-4">
          <h3 className="font-medium text-slate-100">AI Score Breakdown</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>Status: {data.status ?? 'NEW'}</li>
            <li>Score: {data.score ?? 0}</li>
            <li>Expected Salary: {data.expected_salary ?? 'Pending'}</li>
            <li>Notice Period: {data.notice_period ?? 'Pending'}</li>
          </ul>
        </article>
      </section>
      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="glass-card rounded-3xl p-5">
          <h3 className="font-medium text-slate-100">Interview Notes</h3>
          <p className="mt-2 text-sm text-slate-400">{data.interview_notes ?? 'No interview notes captured yet.'}</p>
        </article>
        <article className="glass-card rounded-3xl p-5">
          <h3 className="font-medium text-slate-100">Communication Timeline</h3>
          <p className="mt-2 text-sm text-slate-400">Created: {data.created_at ?? 'N/A'} | Updated: {data.updated_at ?? 'N/A'}</p>
        </article>
      </section>
    </PageScaffold>
  )
}
