import Onboarding from '@/components/features/onboarding'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/onboarding')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="flex h-screen w-screen items-center justify-center">
      <Onboarding />
    </main>
  )
}
