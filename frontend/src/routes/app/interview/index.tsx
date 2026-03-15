import Interview from '@/components/features/interview'
import { RouteError } from '@/components/features/common/route-error'
import { RoutePending } from '@/components/features/common/route-pending'
import { api } from '@/lib/api'
import { getAssessments } from '@/lib/interviewApi'
import type { Assessment, Insight } from '../../../../../shared/types/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/interview/')({
  loader: async (): Promise<{ assessments: Assessment[]; insights: Insight | null }> => {
    const [assessments, insightsRes] = await Promise.all([
      getAssessments(),
      api.get<Insight[]>('/api/insight/industry-insights').then(r => r.data[0] ?? null).catch(() => null),
    ])
    return { assessments, insights: insightsRes }
  },
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteError error={error} />,
  component: RouteComponent,
})

function RouteComponent() {
  const { assessments, insights } = Route.useLoaderData()
  return <Interview assessments={assessments} insights={insights} />
}
