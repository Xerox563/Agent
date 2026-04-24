import { DashboardView } from '@/components/dashboard/DashboardView'
import { fetchCandidates } from '@/lib/api'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const status = params.status || 'ALL'
  const candidates = await fetchCandidates(status)

  return <DashboardView candidates={candidates} status={status} />
}
