import { CandidateTable } from '@/components/CandidateTable'
import { StatusFilter } from '@/components/StatusFilter'
import { fetchCandidates } from '@/lib/api'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const status = params.status || 'ALL'
  const candidates = await fetchCandidates(status)
  const qualified = candidates.filter((candidate) => candidate.status === 'QUALIFIED').length
  const rejected = candidates.filter((candidate) => candidate.status === 'REJECTED').length

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recruiting Dashboard</h1>
      </div>
      <div className="stats shadow bg-base-100">
        <div className="stat">
          <div className="stat-title">Total</div>
          <div className="stat-value text-primary">{candidates.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Qualified</div>
          <div className="stat-value text-success">{qualified}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Rejected</div>
          <div className="stat-value text-error">{rejected}</div>
        </div>
      </div>
      <StatusFilter current={status} />
      <CandidateTable candidates={candidates} />
    </main>
  )
}
