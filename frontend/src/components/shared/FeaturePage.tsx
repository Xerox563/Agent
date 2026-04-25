'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'

import { PageScaffold } from '@/components/layout/PageScaffold'
import { fetchResourceList } from '@/lib/api'

type FeaturePageProps = {
  title: string
  subtitle: string
  endpoint: string
}

export function FeaturePage({ title, subtitle, endpoint }: FeaturePageProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['resource-list', endpoint],
    queryFn: () => fetchResourceList(endpoint),
  })

  return (
    <PageScaffold title={title} subtitle={subtitle}>
      {isLoading ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="glass-card h-36 animate-pulse rounded-3xl p-5" />
          ))}
        </section>
      ) : null}

      {isError ? (
        <section className="glass-card rounded-3xl p-5 text-sm text-rose-300">
          Failed to load data from backend endpoint <code>{endpoint}</code>.
        </section>
      ) : null}

      {!isLoading && !isError ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(data ?? []).map((card, idx) => (
            <motion.article
              key={String(card.id ?? idx)}
              className="glass-card rounded-3xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <h3 className="text-lg font-semibold text-slate-100">{String(card.name ?? card.title ?? card.id ?? 'Record')}</h3>
              <div className="mt-2 space-y-1 text-sm text-slate-400">
                {Object.entries(card)
                  .slice(0, 6)
                  .map(([key, value]) => (
                    <p key={key}>
                      <span className="text-slate-500">{key}:</span> {String(value)}
                    </p>
                  ))}
              </div>
            </motion.article>
          ))}
          {(data ?? []).length === 0 ? (
            <article className="glass-card col-span-full rounded-3xl p-6 text-sm text-slate-400">No records available yet. This view is fully backend-driven and will populate when data exists.</article>
          ) : null}
        </section>
      ) : null}
    </PageScaffold>
  )
}
