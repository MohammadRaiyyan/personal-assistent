import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Assessment, QuizResultData } from '../../../../../shared/types/api'
import { useRouter } from '@tanstack/react-router'
import { format } from 'date-fns'
import { useState } from 'react'
import QuizResult from './quiz-result'
import { cn } from '@/lib/utils'

function scoreColor(score: number) {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  return 'text-rose-500'
}

export default function QuizList({ assessments }: { assessments: Assessment[] }) {
  const router = useRouter()
  const [selectedQuiz, setSelectedQuiz] = useState<QuizResultData | null>(null)

  const toResultData = (a: Assessment): QuizResultData => ({
    score: a.score,
    questions: a.questions,
    improvementTip: a.improvementTips?.[0] ?? null,
  })

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="gradient-title text-2xl">Recent Quizzes</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.navigate({ to: '/app/interview/mock', search: { skillFocus: undefined, category: 'technical', difficulty: 'mid', count: 10, autoStart: false } })}
            >
              New Quiz
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {assessments.map((a, i) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedQuiz(toResultData(a))}
                className="w-full flex items-center justify-between gap-3 py-3 text-left hover:bg-muted/30 transition-colors px-1 rounded"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-muted-foreground w-5 shrink-0">#{assessments.length - i}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        {a.skillFocus?.length ? a.skillFocus.join(', ') : a.category}
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0">{a.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(a.createdAt), 'MMM d, yyyy · h:mm a')}
                    </p>
                  </div>
                </div>
                <span className={cn('text-base font-bold tabular-nums shrink-0', scoreColor(a.score))}>
                  {Math.round(a.score)}%
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Quiz Result</DialogTitle>
          </DialogHeader>
          <QuizResult
            result={selectedQuiz}
            hideStartNew
            onStartNew={() => router.navigate({ to: '/app/interview/mock', search: { skillFocus: undefined, category: 'technical', difficulty: 'mid', count: 10, autoStart: false } })}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
