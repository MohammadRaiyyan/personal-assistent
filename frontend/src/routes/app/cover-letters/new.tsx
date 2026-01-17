import Generate from '@/components/features/cover-letter/generate'
import { Button } from '@/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/app/cover-letters/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-2">
        <Link to="/app/cover-letters/new">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>

        <div className="pb-6">
          <h1 className="text-4xl font-bold gradient-title">
            Create Cover Letter
          </h1>
          <p className="text-muted-foreground">
            Generate a tailored cover letter for your job application
          </p>
        </div>
      </div>

      <Generate />
    </div>
  )
}
