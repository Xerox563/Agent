import type { Candidate } from '@/lib/api'

export function CandidateTable({ candidates }: { candidates: Candidate[] }) {
  return (
    <div className="overflow-x-auto bg-base-100 rounded-box shadow">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Score</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr key={candidate.id}>
              <td>{candidate.name || candidate.email}</td>
              <td>
                <span className="badge badge-outline">{candidate.status || 'NEW'}</span>
              </td>
              <td>{candidate.score ?? '-'}</td>
              <td className="max-w-md truncate">{candidate.summary || 'No summary yet'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
