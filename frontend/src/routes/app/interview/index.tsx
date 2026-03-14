import Interview from '@/components/features/interview'
import { RouteError } from '@/components/features/common/route-error'
import { RoutePending } from '@/components/features/common/route-pending'
import { getAssessments } from '@/lib/interviewApi'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/interview/')({
  loader: async () => {
    return await getAssessments()
  },
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteError error={error} />,
  component: RouteComponent,
})

function RouteComponent() {
  const assessments = Route.useLoaderData()
  return <Interview assessments={assessments} />
}
