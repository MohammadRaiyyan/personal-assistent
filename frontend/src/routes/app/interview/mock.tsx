import TakeAssessment from '@/components/features/interview/take-assesment'
import { createFileRoute } from '@tanstack/react-router'

type Difficulty = 'junior' | 'mid' | 'senior' | 'lead' | 'staff'
type Category = 'technical' | 'behavioral'

export const Route = createFileRoute('/app/interview/mock')({
  head: () => ({
    meta: [
      { title: 'Mock Interview — TrajectAI' },
      { name: 'description', content: 'Test your skills with an AI-generated quiz tailored to your role and difficulty level.' },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    skillFocus: typeof search.skillFocus === 'string' ? search.skillFocus : undefined,
    category: (['technical', 'behavioral'].includes(search.category as string)
      ? search.category
      : 'technical') as Category,
    difficulty: (['junior', 'mid', 'senior', 'lead', 'staff'].includes(search.difficulty as string)
      ? search.difficulty
      : 'mid') as Difficulty,
    count: typeof search.count === 'number' ? search.count : 10,
    autoStart: search.autoStart === true || search.autoStart === 'true',
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <TakeAssessment />
}
