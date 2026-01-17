import Preview from '@/components/features/cover-letter/preview'
import { Button } from '@/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/app/cover-letters/$id')({
  component: RouteComponent,
})
const coverLetter = {
  id: '1',
  jobTitle: 'Frontend Developer',
  companyName: 'Tech Corp',
  content: `
# Cover Letter

Dear Hiring Manager,

I am excited to apply for the Frontend Developer position at Tech Corp. My experience with React and TypeScript makes me a great fit for your team.

I look forward to contributing to your projects!

Best regards,  
Jane Doe
`,
}
function RouteComponent() {
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
          {coverLetter?.jobTitle} at {coverLetter?.companyName}
        </h1>
      </div>

      <Preview content={coverLetter?.content} />
    </div>
  )
}
