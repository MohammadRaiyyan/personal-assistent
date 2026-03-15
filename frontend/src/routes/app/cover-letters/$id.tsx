import Preview from '@/components/features/cover-letter/preview'
import { RouteError } from '@/components/features/common/route-error'
import { RoutePending } from '@/components/features/common/route-pending'
import { Button } from '@/components/ui/button'
import { getCoverLetter } from '@/lib/coverLetterApi'
import type { CoverLetter } from '../../../../../shared/types/api'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/app/cover-letters/$id')({
  head: () => ({
    meta: [
      { title: 'Cover Letter — TrajectAI' },
      { name: 'description', content: 'View, edit, and download your AI-generated cover letter.' },
    ],
  }),
  staleTime: 30_000,
  loader: async ({ params }): Promise<CoverLetter> => {
    return await getCoverLetter(params.id)
  },
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteError error={error} />,
  component: RouteComponent,
})

function RouteComponent() {
  const coverLetter = Route.useLoaderData()

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-2">
        <Link to="/app/cover-letters">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>

        <h1 className="text-4xl font-bold gradient-title mb-6">
          {coverLetter?.positionTitle} at {coverLetter?.companyName}
        </h1>
      </div>

      <Preview content={coverLetter?.content} />
    </div>
  )
}
