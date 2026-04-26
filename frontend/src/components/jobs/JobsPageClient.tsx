'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Briefcase, MapPin, Building2, Search, CheckCircle2, XCircle } from 'lucide-react'
import { PageScaffold } from '@/components/layout/PageScaffold'
import { fetchCandidates, type Candidate } from '@/lib/api'
import httpx from 'axios' // Using axios if available or fetch

// Helper for API calls not in lib/api.ts
const createJob = async (job: any) => {
  const res = await fetch('http://localhost:8000/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job),
  })
  return res.json()
}

const fetchJobs = async () => {
  const res = await fetch('http://localhost:8000/api/jobs')
  const data = await res.json()
  return data.items || []
}

const matchJob = async (candidateId: string, jobId: string) => {
  const res = await fetch('http://localhost:8000/api/jobs/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidate_id: candidateId, job_id: jobId }),
  })
  return res.json()
}

export function JobsPageClient() {
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [newJob, setNewJob] = useState({ title: '', department: '', location: '', requirements: '' })
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [matchingCandidateId, setMatchingCandidateId] = useState('')
  const [matchResult, setMatchResult] = useState<any>(null)

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  })

  const { data: candidates } = useQuery({
    queryKey: ['candidates', 'ALL'],
    queryFn: () => fetchCandidates({ status: 'ALL', page: 1, pageSize: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      setIsAdding(false)
      setNewJob({ title: '', department: '', location: '', requirements: '' })
    },
  })

  const matchMutation = useMutation({
    mutationFn: ({ candidateId, jobId }: { candidateId: string; jobId: string }) => matchJob(candidateId, jobId),
    onSuccess: (data) => {
      setMatchResult(data.match)
    },
  })

  return (
    <PageScaffold title="Jobs" subtitle="Manage job openings and match candidates against descriptions.">
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Active Openings</h2>
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition"
            >
              <Plus size={16} /> Add Job
            </button>
          </div>

          {isAdding && (
            <div className="glass-card mb-6 rounded-3xl p-6 border border-violet-500/30">
              <h3 className="mb-4 font-medium text-slate-100">Create New Job Posting</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  placeholder="Job Title"
                  className="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                />
                <input
                  placeholder="Department"
                  className="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none"
                  value={newJob.department}
                  onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                />
                <input
                  placeholder="Location"
                  className="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                />
                <textarea
                  placeholder="Requirements (Skills, Experience, etc.)"
                  className="md:col-span-2 rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none min-h-[100px]"
                  value={newJob.requirements}
                  onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancel</button>
                <button
                  onClick={() => createMutation.mutate(newJob)}
                  disabled={createMutation.isPending}
                  className="rounded-xl bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Job'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {jobsLoading ? (
              <div className="h-32 animate-pulse rounded-3xl bg-slate-800/50" />
            ) : jobs?.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center">
                <Briefcase className="mx-auto mb-3 text-slate-600" size={40} />
                <p className="text-slate-400">No active jobs found. Click "Add Job" to create one.</p>
              </div>
            ) : (
              jobs?.map((job: any) => (
                <div
                  key={job.id}
                  onClick={() => {
                    setSelectedJob(job)
                    setMatchResult(null)
                    setMatchingCandidateId('')
                  }}
                  className={`glass-card cursor-pointer rounded-3xl p-5 transition hover:border-violet-500/50 ${selectedJob?.id === job.id ? 'border-violet-500 bg-violet-500/5' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-100">{job.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Building2 size={14} /> {job.department}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                      {job.status || 'ACTIVE'}
                    </span>
                  </div>
                  {selectedJob?.id === job.id && (
                    <div className="mt-4 border-t border-slate-700/50 pt-4">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-2">Requirements</p>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">{job.requirements}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="glass-card sticky top-6 rounded-3xl p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-100">Resume Parser</h2>
            <p className="mb-6 text-sm text-slate-400">Match candidates against the selected job description.</p>

            {!selectedJob ? (
              <div className="rounded-2xl bg-slate-900/50 p-6 text-center border border-dashed border-slate-700">
                <p className="text-xs text-slate-500">Select a job from the list to start matching candidates.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Select Candidate</label>
                  <select
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none"
                    value={matchingCandidateId}
                    onChange={(e) => {
                      setMatchingCandidateId(e.target.value)
                      setMatchResult(null)
                    }}
                  >
                    <option value="">Choose a candidate...</option>
                    {candidates?.items.map((c: Candidate) => (
                      <option key={c.id} value={c.id}>{c.name || c.email}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => matchMutation.mutate({ candidateId: matchingCandidateId, jobId: selectedJob.id })}
                  disabled={!matchingCandidateId || matchMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition"
                >
                  {matchMutation.isPending ? 'Analyzing...' : <><Search size={18} /> Match Candidate</>}
                </button>

                {matchResult && (
                  <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-200">Match Score</span>
                      <span className={`text-2xl font-bold ${matchResult.match_score > 70 ? 'text-emerald-400' : matchResult.match_score > 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {matchResult.match_score}%
                      </span>
                    </div>
                    <div className="mb-4 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${matchResult.match_score > 70 ? 'bg-emerald-500' : matchResult.match_score > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${matchResult.match_score}%` }}
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500 mb-1">Reasoning</p>
                        <p className="text-sm text-slate-300">{matchResult.reasoning}</p>
                      </div>

                      {matchResult.missing_skills?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase text-slate-500 mb-2">Missing Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {matchResult.missing_skills.map((skill: string, idx: number) => (
                              <span key={idx} className="flex items-center gap-1 rounded-lg bg-rose-500/10 px-2 py-1 text-[10px] text-rose-300 border border-rose-500/20">
                                <XCircle size={10} /> {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500 mb-1">Recommendations</p>
                        <p className="text-sm text-slate-300">{matchResult.recommendations}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageScaffold>
  )
}
