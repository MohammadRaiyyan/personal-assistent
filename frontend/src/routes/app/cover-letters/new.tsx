import Generate from '@/components/features/cover-letter/generate'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/cover-letters/new')({
  head: () => ({
    meta: [
      { title: 'New Cover Letter — TrajectAI' },
      { name: 'description', content: 'Generate a personalized, job-specific cover letter with AI in seconds.' },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <Generate />
}
