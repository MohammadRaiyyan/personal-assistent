import { RouteError } from '@/components/features/common/route-error'
import { RoutePending } from '@/components/features/common/route-pending'
import CoverLetters from '@/components/features/cover-letter/cover-letters'
import { Button } from '@/components/ui/button'
import { getCoverLetters } from '@/lib/coverLetterApi'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/app/cover-letters/')({
  head: () => ({
    meta: [
      { title: 'Cover Letters — TrajectAI' },
      { name: 'description', content: 'Generate tailored, job-specific cover letters in seconds with AI.' },
    ],
  }),
  loader: async () => {
    return await getCoverLetters()
  },
  pendingComponent: RoutePending,
  errorComponent: ({ error }) => <RouteError error={error} />,
  component: RouteComponent,
})

function RouteComponent() {
  const coverLetters = Route.useLoaderData()

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-3xl font-medium gradient-title">
          My Cover Letters
        </h1>
        <Link to="/app/cover-letters/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create New
          </Button>
        </Link>
      </div>

      <CoverLetters coverLetters={coverLetters} />
    </div>
  )
}
