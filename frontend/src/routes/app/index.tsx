import Insights from '@/components/features/dashboard/insights'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/')({
  component: RouteComponent,
})

const dummyInsights = {
  lastUpdated: new Date().toISOString(),
  nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  marketOutlook: 'Positive',
  growthRate: 8.2,
  demandLevel: 'High',
  topSkills: ['React', 'TypeScript', 'Node.js'],
  salaryRanges: [
    { role: 'Frontend Developer', min: 60000, median: 90000, max: 120000 },
    { role: 'Backend Developer', min: 65000, median: 95000, max: 130000 },
    { role: 'Full Stack Developer', min: 70000, median: 100000, max: 140000 },
  ],
  keyTrends: [
    'Remote work adoption',
    'AI integration in workflows',
    'Focus on cybersecurity',
  ],
  recommendedSkills: ['GraphQL', 'Docker', 'Cloud Computing'],
}

function RouteComponent() {
  return (
    <div>
      <Insights insights={dummyInsights} />
    </div>
  )
}
