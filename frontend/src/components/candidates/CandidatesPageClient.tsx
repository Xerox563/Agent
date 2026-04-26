"use client";

import Link from "next/link";
import { FileText, Eye, Trash2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PageScaffold } from "@/components/layout/PageScaffold";
import {
  fetchCandidates,
  updateCandidateStatus,
  deleteCandidate,
  deleteRecentCandidates,
  clearAllCandidates,
  type Candidate,
  type CandidateStatus,
} from "@/lib/api";

const statuses: Array<{ label: string; value: string }> = [
  { label: "All", value: "ALL" },
  { label: "Qualified", value: "QUALIFIED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Needs Info", value: "NEEDS_INFO" },
  { label: "Interview Ready", value: "INTERVIEW_READY" },
  { label: "New", value: "NEW" },
];

export function CandidatesPageClient() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const candidatesQuery = useQuery({
    queryKey: ["candidates", status, search, page],
    queryFn: () => fetchCandidates({ status, search, page, pageSize: 10 }),
    refetchInterval: 15000,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      candidateId,
      nextStatus,
    }: {
      candidateId: string;
      nextStatus: CandidateStatus;
    }) => updateCandidateStatus(candidateId, nextStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      alert("Failed to delete candidate. Please check console for details.");
    },
  });

  const deleteRecentMutation = useMutation({
    mutationFn: (minutes: number) => deleteRecentCandidates(minutes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (error) => {
      console.error("Bulk delete failed:", error);
      alert("Failed to delete recent candidates.");
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => clearAllCandidates(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      alert("All candidates cleared successfully.");
    },
    onError: (error: any) => {
      console.error("Clear all failed:", error);
      const message = error.response?.data?.detail || error.message || "Unknown error";
      alert(`Failed to clear all candidates: ${message}`);
    },
  });

  const totalPages = useMemo(() => {
    if (!candidatesQuery.data) return 1;
    return Math.max(
      1,
      Math.ceil(
        candidatesQuery.data.pagination.total /
          candidatesQuery.data.pagination.page_size,
      ),
    );
  }, [candidatesQuery.data]);

  return (
    <PageScaffold
      title="Candidates"
      subtitle="Live ATS candidate management synced with backend data."
    >
      <section className="glass-card rounded-3xl p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-3">
            <input
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search by candidate name or email"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none md:max-w-md"
            />
            <button
              onClick={() => {
                if (confirm("Are you sure you want to remove all candidates from the last hour?")) {
                  deleteRecentMutation.mutate(60);
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/20 transition whitespace-nowrap"
              disabled={deleteRecentMutation.isPending}
            >
              <Trash2 size={16} />
              Remove Recent
            </button>
            <button
              onClick={() => {
                if (confirm("DANGER: Are you sure you want to delete ALL candidates from the database? This cannot be undone.")) {
                  clearAllMutation.mutate();
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-red-600/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-600/20 transition border border-red-600/20 whitespace-nowrap"
              disabled={clearAllMutation.isPending}
            >
              <XCircle size={16} />
              Clear All
            </button>
          </div>
          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
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

        {candidatesQuery.isLoading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-slate-800/60" />
        ) : null}
        {candidatesQuery.isError ? (
          <p className="text-sm text-rose-300">
            Failed to load candidates from backend.
          </p>
        ) : null}

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
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(candidatesQuery.data.items as Candidate[]).map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3">
                      <Link
                        href={`/candidates/${candidate.id}`}
                        className="font-medium text-violet-300 hover:underline"
                      >
                        {String(candidate.name ?? "Unknown")}
                      </Link>
                    </td>
                    <td>{String(candidate.email)}</td>
                    <td>{String(candidate.role ?? "-")}</td>
                    <td>{String(candidate.score ?? "-")}</td>
                    <td>
                      <select
                        value={String(candidate.status ?? "NEW")}
                        onChange={(event) =>
                          updateMutation.mutate({
                            candidateId: candidate.id,
                            nextStatus: event.target.value as CandidateStatus,
                          })
                        }
                        className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1 text-xs"
                      >
                        {statuses
                          .filter((s) => s.value !== "ALL")
                          .map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/candidates/${candidate.id}`}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        {!!candidate.resume_path && (
                          <a
                            href={`http://localhost:8000/api/candidates/${candidate.id}/resume`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                            title="Download Resume"
                          >
                            <FileText size={18} />
                          </a>
                        )}
                        <button
                          onClick={() => {
                            const c = candidate as any;
                            if (confirm(`Are you sure you want to delete ${c.name || c.email}?`)) {
                              deleteMutation.mutate(candidate.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Candidate"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-xl border border-slate-700 px-3 py-2 text-xs disabled:opacity-40"
          >
            Previous
          </button>
          <p className="text-xs text-slate-400">
            Page {page} of {totalPages}
          </p>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-slate-700 px-3 py-2 text-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </section>
    </PageScaffold>
  );
}
