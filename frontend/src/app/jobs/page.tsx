import { FeaturePage } from '@/components/shared/FeaturePage'

export default function JobsPage() {
  return <FeaturePage title="Jobs" subtitle="Manage openings, capacity, and progress for each hiring plan." endpoint="/api/jobs" />
}
