import PerformanceChart from './performance-chart'
import QuizList from './quiz-list'
import StatsCards from './stats-cards'
export default async function Interview() {
  const assessments = [
    {
      id: 1,
      quizScore: 85.5,
      createdAt: '2026-01-10T14:30:00Z',
      questions: [
        { id: 1, question: 'What is React?', correct: true },
        { id: 2, question: 'Explain useState.', correct: true },
        { id: 3, question: 'What is JSX?', correct: false },
        // ...more questions
      ],
      improvementTip: 'Review JSX concepts for better scores.',
    },
    {
      id: 2,
      quizScore: 72.0,
      createdAt: '2026-01-05T10:00:00Z',
      questions: [
        { id: 1, question: 'What is Node.js?', correct: true },
        { id: 2, question: 'Explain event loop.', correct: false },
        { id: 3, question: 'What is Express?', correct: true },
        // ...more questions
      ],
      improvementTip: 'Practice event loop questions.',
    },
    {
      id: 3,
      quizScore: 90.0,
      createdAt: '2025-12-28T16:45:00Z',
      questions: [
        { id: 1, question: 'What is system design?', correct: true },
        { id: 2, question: 'Explain scalability.', correct: true },
        { id: 3, question: 'What is load balancing?', correct: true },
        // ...more questions
      ],
      improvementTip: 'Excellent! Keep practicing advanced topics.',
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-4xl font-bold gradient-title">
          Interview Preparation
        </h1>
      </div>
      <div className="space-y-6">
        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </div>
    </div>
  )
}
