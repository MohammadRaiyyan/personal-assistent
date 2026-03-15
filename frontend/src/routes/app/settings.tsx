import { RouteError } from '@/components/features/common/route-error'
import { RoutePending } from '@/components/features/common/route-pending'
import Settings from '@/components/features/settings'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/settings')({
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteError error={error} />,
  component: RouteComponent,
})

function RouteComponent() {
  return <Settings />
}
