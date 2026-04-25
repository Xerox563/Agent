import { FeaturePage } from '@/components/shared/FeaturePage'

export default function EmailPipelinePage() {
  return <FeaturePage title="Email Pipeline" subtitle="Automate inbox triage, candidate detection, and parsing at scale." endpoint="/api/emails" />
}
