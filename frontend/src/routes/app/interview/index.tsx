import Interview from '@/components/features/interview'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/interview/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Interview />
}
