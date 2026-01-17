import TakeAssessment from '@/components/features/interview/take-assesment'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/interview/mock')({
  component: RouteComponent,
})

function RouteComponent() {
  return <TakeAssessment />
}
