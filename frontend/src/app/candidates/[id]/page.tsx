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
  const links = Array.isArray(data.links) ? data.links : []

  return (
    <PageScaffold title="Candidate Profile" subtitle="Deep AI profile with resume intelligence and communication timeline.">
      <section className="grid gap-4 xl:grid-cols-12">
        <article className="glass-card rounded-3xl p-5 xl:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-100">{data.name ?? data.email}</h2>
            {data.resume_path && (
              <a
                href={`http://localhost:8000/api/candidates/${data.id}/resume`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-violet-500/20 px-3 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-500/30 transition"
              >
                Download Resume
              </a>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-400">{data.description ?? data.summary ?? 'Candidate summary will appear once AI processing is complete.'}</p>
          <div className="mt-4 rounded-2xl border border-slate-700/60 bg-slate-900/55 p-4 text-sm text-slate-300">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Role</p>
                <p>{data.role ?? 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Experience</p>
                <p>{data.experience ?? 'Unknown'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 uppercase">Skills</p>
                <p>{skills}</p>
              </div>
              {links.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 uppercase">Links</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {links.map((link: string, idx: number) => (
                      <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>
        <article className="glass-card rounded-3xl p-5 xl:col-span-4">
          <h3 className="font-medium text-slate-100">Candidate Details</h3>
          <ul className="mt-3 space-y-4 text-sm text-slate-300">
            <li>
              <p className="text-xs text-slate-500 uppercase">Status</p>
              <p className="font-medium">{data.status ?? 'NEW'}</p>
            </li>
            <li>
              <p className="text-xs text-slate-500 uppercase">AI Score</p>
              <p className="font-medium">{data.score ?? 0}/100</p>
            </li>
            <li>
              <p className="text-xs text-slate-500 uppercase">Notice Period</p>
              <p className="font-medium">{data.notice_period ?? 'Pending'}</p>
            </li>
            <li>
              <p className="text-xs text-slate-500 uppercase">Expected Salary</p>
              <p className="font-medium">{data.expected_salary ?? 'Pending'}</p>
            </li>
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
