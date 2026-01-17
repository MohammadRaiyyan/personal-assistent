import ResumeBuilder from '@/components/features/resume/form-builder'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/resume')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-6">
      <h1 className="font-bold gradient-title text-4xl">Resume Builder</h1>
      <ResumeBuilder initialContent="Hello" />
    </div>
  )
}
