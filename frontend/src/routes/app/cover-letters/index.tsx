import CoverLetters from '@/components/features/cover-letter/cover-letters'
import { Button } from '@/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/app/cover-letters/')({
  component: RouteComponent,
})
const coverLetters = [
  {
    id: '1',
    jobTitle: 'Frontend Developer',
    companyName: 'Tech Corp',
    createdAt: '2025-12-01T10:00:00Z',
    jobDescription:
      'Develop and maintain user interfaces using React and TypeScript.',
  },
  {
    id: '2',
    jobTitle: 'Backend Engineer',
    companyName: 'Data Solutions',
    createdAt: '2025-11-15T14:30:00Z',
    jobDescription: 'Design and implement APIs and microservices with Node.js.',
  },
]
function RouteComponent() {
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
        <h1 className="text-4xl font-medium gradient-title">
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
