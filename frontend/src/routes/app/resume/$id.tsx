import ResumeBuilder from '@/components/features/resume/form-builder'
import { RouteError } from '@/components/features/common/route-error'
import { RoutePending } from '@/components/features/common/route-pending'
import { getResume } from '@/lib/resumeApi'
import type { Resume } from '../../../../../shared/types/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/resume/$id')({
  head: () => ({
    meta: [
      { title: 'Resume Builder — TrajectAI' },
      { name: 'description', content: 'Craft and fine-tune your resume with AI-powered suggestions and templates.' },
    ],
  }),
  loader: async ({ params }): Promise<Resume> => getResume(params.id),
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteError error={error} />,
  component: RouteComponent,
})

function RouteComponent() {
  const resume = Route.useLoaderData()
  return <ResumeBuilder resume={resume} />
}
