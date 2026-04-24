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

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recruiting Dashboard</h1>
      </div>
      <StatusFilter current={status} />
      <CandidateTable candidates={candidates} />
    </main>
  )
}
