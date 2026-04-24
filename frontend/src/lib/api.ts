export type Candidate = {
  id: string
  email: string
  name?: string
  status?: 'NEW' | 'QUALIFIED' | 'REJECTED' | 'NEEDS_MORE_INFO'
  score?: number
  summary?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export async function fetchCandidates(status?: string): Promise<Candidate[]> {
  const url = new URL(`${API_BASE}/candidates`)
  if (status && status !== 'ALL') {
    url.searchParams.set('status', status)
  }

  const response = await fetch(url.toString(), { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Failed to fetch candidates')
  }

  const json = await response.json()
  return json.candidates ?? []
}
