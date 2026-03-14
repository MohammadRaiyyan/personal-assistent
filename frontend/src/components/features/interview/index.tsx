import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Assessment } from '../../../../../shared/types/api'
import { Link } from '@tanstack/react-router'
import { Brain } from 'lucide-react'
import PerformanceChart from './performance-chart'
import QuizList from './quiz-list'
import StatsCards from './stats-cards'

export default function Interview({ assessments }: { assessments: Assessment[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-4xl font-bold gradient-title">
          Interview Preparation
        </h1>
        <Link to="/app/interview/mock">
          <Button>Start Quiz</Button>
        </Link>
      </div>

      {assessments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <Brain className="h-12 w-12 text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold">No quizzes taken yet</h2>
              <p className="text-muted-foreground mt-1 max-w-sm">
                Take your first quiz to start tracking your interview preparation progress.
              </p>
            </div>
            <Link to="/app/interview/mock">
              <Button size="lg">Start Your First Quiz</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <StatsCards assessments={assessments} />
          <PerformanceChart assessments={assessments} />
          <QuizList assessments={assessments} />
        </div>
      )}
    </div>
  )
}
