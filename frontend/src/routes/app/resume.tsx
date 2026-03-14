import ResumeBuilder from '@/components/features/resume/form-builder'
import { RouteError } from '@/components/features/common/route-error'
import { RoutePending } from '@/components/features/common/route-pending'
import { getResumes } from '@/lib/resumeApi'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/resume')({
  loader: async () => {
    const results = await getResumes()
    // API returns array of resumes; pick first (or null)
    const resume = Array.isArray(results) ? (results[0] ?? null) : results
    return resume
  },
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteError error={error} />,
  component: RouteComponent,
})

function RouteComponent() {
  const resume = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <h1 className="font-bold gradient-title text-4xl">Resume Builder</h1>
      <ResumeBuilder
        initialContent={resume?.content ?? ''}
        resumeId={resume?.id}
      />
    </div>
  )
}
