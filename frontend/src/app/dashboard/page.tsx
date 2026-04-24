import { DashboardView } from '@/components/dashboard/DashboardView'
import type { Candidate } from '@/lib/api'
import { fetchCandidates } from '@/lib/api'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const status = params.status || 'ALL'
  let candidates: Candidate[] = []
  try {
    candidates = await fetchCandidates(status)
  } catch {
    candidates = []
  }

  return <DashboardView candidates={candidates} status={status} />
}
