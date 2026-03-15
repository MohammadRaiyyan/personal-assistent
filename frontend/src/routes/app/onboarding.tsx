import Onboarding from '@/components/features/onboarding'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/onboarding')({
  head: () => ({
    meta: [
      { title: 'Get Started — TrajectAI' },
      { name: 'description', content: 'Set up your career profile to unlock personalized AI-powered guidance.' },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="flex h-screen w-screen items-center justify-center">
      <Onboarding />
    </main>
  )
}
