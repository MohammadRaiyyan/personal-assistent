import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import Quiz from './quiz'

export default function TakeAssessment() {
  return (
    <div className="container mx-auto space-y-4 py-6">
      <div className="flex flex-col space-y-2 mx-2">
        <Link to="/app/interview">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Preparation
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-medium gradient-title">
            Mock Interview
          </h1>
          <p className="text-muted-foreground">
            Test your knowledge with industry-specific questions
          </p>
        </div>
      </div>

      <Quiz />
    </div>
  )
}
