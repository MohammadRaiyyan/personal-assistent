import ResumeList from '@/components/features/resume/resume-list'
import { RouteError } from '@/components/features/common/route-error'
import { RoutePending } from '@/components/features/common/route-pending'
import { getResumes } from '@/lib/resumeApi'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/resume/')({
  head: () => ({
    meta: [
      { title: 'Resumes — TrajectAI' },
      { name: 'description', content: 'Build and manage ATS-optimized resumes with AI assistance.' },
    ],
  }),
  loader: async () => getResumes(),
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteError error={error} />,
  component: RouteComponent,
})

function RouteComponent() {
  const resumes = Route.useLoaderData()
  return <ResumeList resumes={resumes} />
}
