import type { ReactNode } from 'react'

import { AppSidebar } from '@/components/layout/AppSidebar'
import { TopHeader } from '@/components/layout/TopHeader'

type PageScaffoldProps = {
  title: string
  subtitle: string
  children: ReactNode
}

export function PageScaffold({ title, subtitle, children }: PageScaffoldProps) {
  return (
    <div className="premium-scrollbar min-h-screen overflow-x-hidden px-4 py-4 lg:px-6">
      <div className="mx-auto flex max-w-[1700px] gap-5">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <TopHeader title={title} subtitle={subtitle} />
          {children}
        </div>
      </div>
    </div>
  )
}
