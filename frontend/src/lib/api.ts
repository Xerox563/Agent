import axios from 'axios'

export type CandidateStatus = 'NEW' | 'QUALIFIED' | 'REJECTED' | 'NEEDS_INFO' | 'INTERVIEW_READY'

export type Candidate = {
  id: string
  email: string
  name?: string
  role?: string
  status?: CandidateStatus
  score?: number
  summary?: string
  skills?: string[] | string
  expected_salary?: string
  notice_period?: string
  source?: string
  created_at?: string
  updated_at?: string
  interview_notes?: string
  [key: string]: unknown
}

export type PaginatedResponse<T> = {
  items: T[]
  pagination: { page: number; page_size: number; total: number }
}

export type DashboardSummary = {
  total_candidates: number
  qualified: number
  rejected: number
  needs_info: number
  interview_ready: number
  avg_score: number
  open_jobs: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
})

export async function fetchCandidates(params: {
  status?: string
  search?: string
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<Candidate>> {
  const response = await apiClient.get('/api/candidates', {
    params: {
      status: params.status,
      search: params.search,
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
    },
  })
  return response.data
}

export async function fetchCandidate(candidateId: string): Promise<Candidate> {
  const response = await apiClient.get(`/api/candidates/${candidateId}`)
  return response.data.item
}

export async function updateCandidateStatus(candidateId: string, status: CandidateStatus): Promise<Candidate> {
  const response = await apiClient.patch(`/api/candidates/${candidateId}/status`, { status })
  return response.data.item
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get('/api/dashboard/summary')
  return response.data
}

export async function fetchDashboardPipeline(): Promise<{ stage: string; value: number }[]> {
  const response = await apiClient.get('/api/dashboard/pipeline')
  return response.data.stages ?? []
}

export async function fetchDashboardActivity(): Promise<Array<{ id?: string; message: string; created_at?: string }>> {
  const response = await apiClient.get('/api/dashboard/activity')
  return response.data.items ?? []
}

export async function fetchDashboardSkills(): Promise<Array<{ skill: string; count: number }>> {
  const response = await apiClient.get('/api/dashboard/skills')
  return response.data.items ?? []
}

export async function fetchDashboardTrends(): Promise<Array<{ date: string; received: number; qualified: number; rejected: number }>> {
  const response = await apiClient.get('/api/dashboard/trends')
  return response.data.items ?? []
}

export async function fetchDashboardRecentCandidates(): Promise<Candidate[]> {
  const response = await apiClient.get('/api/dashboard/recent-candidates')
  return response.data.items ?? []
}

export async function fetchResourceList(path: string): Promise<Record<string, unknown>[]> {
  const response = await apiClient.get(path)
  if (Array.isArray(response.data.items)) return response.data.items
  if (response.data.item && typeof response.data.item === 'object') return [response.data.item]
  return []
}
