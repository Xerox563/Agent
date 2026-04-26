'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { PageScaffold } from '@/components/layout/PageScaffold'
import { fetchCandidates, updateCandidateStatus, type Candidate, type CandidateStatus } from '@/lib/api'

const statuses: Array<{ label: string; value: string }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Qualified', value: 'QUALIFIED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Needs Info', value: 'NEEDS_INFO' },
  { label: 'Interview Ready', value: 'INTERVIEW_READY' },
  { label: 'New', value: 'NEW' },
]

export function CandidatesPageClient() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const candidatesQuery = useQuery({
    queryKey: ['candidates', status, search, page],
    queryFn: () => fetchCandidates({ status, search, page, pageSize: 10 }),
    refetchInterval: 15000,
  })

  const updateMutation = useMutation({
    mutationFn: ({ candidateId, nextStatus }: { candidateId: string; nextStatus: CandidateStatus }) => updateCandidateStatus(candidateId, nextStatus),
    onMutate: async ({ candidateId, nextStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['candidates'] })
      const previous = queryClient.getQueriesData({ queryKey: ['candidates'] })
      queryClient.setQueriesData({ queryKey: ['candidates'] }, (old: { items: Candidate[] } | undefined) => {
        if (!old) return old
        return { ...old, items: old.items.map((item) => (item.id === candidateId ? { ...item, status: nextStatus } : item)) }
      })
      return { previous }
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })

  const totalPages = useMemo(() => {
    if (!candidatesQuery.data) return 1
    return Math.max(1, Math.ceil(candidatesQuery.data.pagination.total / candidatesQuery.data.pagination.page_size))
  }, [candidatesQuery.data])

  return (
    <PageScaffold title="Candidates" subtitle="Live ATS candidate management synced with backend data.">
      <section className="glass-card rounded-3xl p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={search}
            onChange={(event) => {
              setPage(1)
              setSearch(event.target.value)
            }}
            placeholder="Search by candidate name or email"
            className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none md:max-w-md"
          />
          <select
            value={status}
            onChange={(event) => {
              setPage(1)
              setStatus(event.target.value)
            }}
            className="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none"
          >
            {statuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {candidatesQuery.isLoading ? <div className="h-64 animate-pulse rounded-2xl bg-slate-800/60" /> : null}
        {candidatesQuery.isError ? <p className="text-sm text-rose-300">Failed to load candidates from backend.</p> : null}

        {candidatesQuery.data ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Score</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {candidatesQuery.data.items.map((candidate) => (
                  <tr key={candidate.id} className="border-t border-slate-700/50">
                    <td className="py-3">{candidate.name ?? '-'}</td>
                    <td>{candidate.email}</td>
                    <td>{candidate.role ?? '-'}</td>
                    <td>{candidate.score ?? '-'}</td>
                    <td>
                      <select
                        value={candidate.status ?? 'NEW'}
                        onChange={(event) => updateMutation.mutate({ candidateId: candidate.id, nextStatus: event.target.value as CandidateStatus })}
                        className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1 text-xs"
                      >
                        {statuses
                          .filter((s) => s.value !== 'ALL')
                          .map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl border border-slate-700 px-3 py-2 text-xs disabled:opacity-40">
            Previous
          </button>
          <p className="text-xs text-slate-400">
            Page {page} of {totalPages}
          </p>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-xl border border-slate-700 px-3 py-2 text-xs disabled:opacity-40">
            Next
          </button>
        </div>
      </section>
    </PageScaffold>
  )
}
