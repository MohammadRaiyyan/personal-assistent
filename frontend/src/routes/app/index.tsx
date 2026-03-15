import Insights from '@/components/features/dashboard/insights'
import { RouteError } from '@/components/features/common/route-error'
import { RoutePending } from '@/components/features/common/route-pending'
import { api } from '@/lib/api'
import type { Insight } from '../../../../shared/types/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/')({
  head: () => ({
    meta: [
      { title: 'Dashboard — TrajectAI' },
      { name: 'description', content: 'Your AI-powered career dashboard — market insights, salary trends, and personalized recommendations.' },
    ],
  }),
  loader: async (): Promise<Insight | null> => {
    const res = await api.get<Insight[]>('/api/insight/industry-insights')
    if (res.data[0]) return res.data[0]
    // No insights yet — generate them
    const created = await api.post<Insight[]>('/api/insight/industry-insights')
    return created.data[0] ?? null
  },
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteError error={error} />,
  component: RouteComponent,
})

const dummyInsights: Insight = {
  id: 'demo',
  industry: 'Software Engineering',
  lastUpdated: new Date().toISOString(),
  nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  marketOutlook: 'positive',
  jobGrowth: 8.2,
  demandLevel: 'high',
  keySkills: ['React', 'TypeScript', 'Node.js'],
  salaryRanges: [
    { role: 'Frontend Developer', min: 60000, median: 90000, max: 120000, currency: 'USD', location: 'US' },
    { role: 'Backend Developer', min: 65000, median: 95000, max: 130000, currency: 'USD', location: 'US' },
    { role: 'Full Stack Developer', min: 70000, median: 100000, max: 140000, currency: 'USD', location: 'US' },
  ],
  keyTrends: [
    'Remote work adoption',
    'AI integration in workflows',
    'Focus on cybersecurity',
  ],
  recommendedSkills: ['GraphQL', 'Docker', 'Cloud Computing'],
}

function RouteComponent() {
  const insights = Route.useLoaderData() ?? dummyInsights

  return (
    <div>
      <Insights insights={insights} />
    </div>
  )
}
