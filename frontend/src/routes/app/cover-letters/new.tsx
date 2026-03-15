import Generate from '@/components/features/cover-letter/generate'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/cover-letters/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Generate />
}
