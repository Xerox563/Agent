import { FeaturePage } from '@/components/shared/FeaturePage'

export default function SettingsPage() {
  return <FeaturePage title="Settings" subtitle="Central control for AI behavior, team governance, and platform policies." endpoint="/api/settings" />
}
