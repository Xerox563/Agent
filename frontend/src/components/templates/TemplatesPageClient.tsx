'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Mail, Share2, Copy, CheckCircle2, Trash2 } from 'lucide-react'
import { PageScaffold } from '@/components/layout/PageScaffold'
import { fetchCandidates, type Candidate } from '@/lib/api'

const fetchTemplates = async () => {
  const res = await fetch('http://localhost:8000/api/templates')
  const data = await res.json()
  return data.items || []
}

const createTemplate = async (template: any) => {
  const res = await fetch('http://localhost:8000/api/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template),
  })
  return res.json()
}

export function TemplatesPageClient() {
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ name: '', type: 'QUALIFIED', subject: '', body: '' })
  const [selectedCandidateId, setSelectedCandidateId] = useState('')
  const [copied, setCopied] = useState(false)

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  })

  const { data: candidates } = useQuery({
    queryKey: ['candidates', 'ALL'],
    queryFn: () => fetchCandidates({ status: 'ALL', page: 1, pageSize: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      setIsAdding(false)
      setNewTemplate({ name: '', type: 'QUALIFIED', subject: '', body: '' })
    },
  })

  const getDynamicBody = (body: string, candidate: Candidate | undefined) => {
    if (!candidate) return body
    return body
      .replace(/{{name}}/g, candidate.name || 'Candidate')
      .replace(/{{role}}/g, candidate.role || 'Position')
      .replace(/{{email}}/g, candidate.email || '')
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <PageScaffold title="Templates" subtitle="Create and share dynamic email templates for candidate communication.">
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Email Templates</h2>
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition"
            >
              <Plus size={16} /> New Template
            </button>
          </div>

          {isAdding && (
            <div className="glass-card mb-6 rounded-3xl p-6 border border-violet-500/30">
              <h3 className="mb-4 font-medium text-slate-100">Create Template</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="Template Name"
                    className="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  />
                  <select
                    className="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none"
                    value={newTemplate.type}
                    onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}
                  >
                    <option value="QUALIFIED">Qualified</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="FOLLOW_UP">Follow Up</option>
                  </select>
                </div>
                <input
                  placeholder="Subject"
                  className="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                />
                <textarea
                  placeholder="Email Body (Use {{name}}, {{role}} as variables)"
                  className="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none min-h-[150px]"
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancel</button>
                <button
                  onClick={() => createMutation.mutate(newTemplate)}
                  disabled={createMutation.isPending}
                  className="rounded-xl bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition"
                >
                  Save Template
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {templatesLoading ? (
              <div className="h-32 animate-pulse rounded-3xl bg-slate-800/50" />
            ) : (
              templates?.map((template: any) => (
                <div key={template.id} className="glass-card rounded-3xl p-5 border border-slate-800 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${template.type === 'QUALIFIED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        <Mail size={16} />
                      </div>
                      <h3 className="font-medium text-slate-100">{template.name}</h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">{template.type}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase">Subject</p>
                  <p className="text-sm text-slate-300 mb-3">{template.subject}</p>
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase">Body Preview</p>
                  <p className="text-sm text-slate-400 line-clamp-2">{template.body}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="xl:col-span-5">
          <div className="glass-card sticky top-6 rounded-3xl p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-100">Share with Candidate</h2>
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">1. Select Candidate</label>
                <select
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 outline-none"
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(e.target.value)}
                >
                  <option value="">Choose a candidate...</option>
                  {candidates?.items.map((c: Candidate) => (
                    <option key={c.id} value={c.id}>{c.name || c.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">2. Preview Templates</label>
                {!selectedCandidateId ? (
                  <div className="p-4 rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 text-center">
                    <p className="text-xs text-slate-500 italic text-center">Select a candidate to preview dynamic content</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {templates?.map((template: any) => {
                      const candidate = candidates?.items.find((c: Candidate) => c.id === selectedCandidateId)
                      const dynamicBody = getDynamicBody(template.body, candidate)
                      return (
                        <div key={template.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-violet-400 uppercase">{template.name}</span>
                            <button
                              onClick={() => handleCopy(dynamicBody)}
                              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                              title="Copy to clipboard"
                            >
                              {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                            </button>
                          </div>
                          <div className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                            {dynamicBody}
                          </div>
                          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600/20 py-2 text-xs font-semibold text-violet-300 hover:bg-violet-600/30 transition">
                            <Share2 size={14} /> Send Email Directly
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageScaffold>
  )
}
