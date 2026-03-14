import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { QuizResultData } from '../../../../../shared/types/api'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Sparkles,
  Target,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

type Mood = 'legendary' | 'great' | 'good' | 'keep-going'

function getMood(score: number): Mood {
  if (score >= 90) return 'legendary'
  if (score >= 70) return 'great'
  if (score >= 50) return 'good'
  return 'keep-going'
}

const MOOD_CONFIG: Record<
  Mood,
  {
    icon: React.ReactNode
    headline: string
    sub: string
    scoreColor: string
    ringColor: string
    bgGlow: string
    feedbackBg: string
    feedbackBorder: string
  }
> = {
  legendary: {
    icon: <Trophy className="h-8 w-8 text-yellow-400" />,
    headline: 'Legendary! 🏆',
    sub: "You're operating at an elite level. Outstanding performance!",
    scoreColor: 'text-yellow-400',
    ringColor: 'stroke-yellow-400',
    bgGlow: 'shadow-yellow-500/20',
    feedbackBg: 'bg-yellow-500/10',
    feedbackBorder: 'border-yellow-500/30',
  },
  great: {
    icon: <Sparkles className="h-8 w-8 text-blue-400" />,
    headline: 'Great Work! ⭐',
    sub: 'Solid knowledge and sharp thinking — you nailed most of it.',
    scoreColor: 'text-blue-400',
    ringColor: 'stroke-blue-400',
    bgGlow: 'shadow-blue-500/20',
    feedbackBg: 'bg-blue-500/10',
    feedbackBorder: 'border-blue-500/30',
  },
  good: {
    icon: <Zap className="h-8 w-8 text-orange-400" />,
    headline: 'Good Effort! 💪',
    sub: "You're on the right track — a bit more practice and you'll ace it.",
    scoreColor: 'text-orange-400',
    ringColor: 'stroke-orange-400',
    bgGlow: 'shadow-orange-500/20',
    feedbackBg: 'bg-orange-500/10',
    feedbackBorder: 'border-orange-500/30',
  },
  'keep-going': {
    icon: <Flame className="h-8 w-8 text-rose-400" />,
    headline: 'Keep Going! 🌱',
    sub: "Every expert started somewhere. This is your starting line — not finish.",
    scoreColor: 'text-rose-400',
    ringColor: 'stroke-rose-400',
    bgGlow: 'shadow-rose-500/20',
    feedbackBg: 'bg-rose-500/10',
    feedbackBorder: 'border-rose-500/30',
  },
}

function ScoreRing({ score, mood }: { score: number; mood: Mood }) {
  const config = MOOD_CONFIG[mood]
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/30"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('transition-all duration-1000 ease-out', config.ringColor)}
          style={{ filter: 'drop-shadow(0 0 6px currentColor)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn('text-3xl font-bold tabular-nums', config.scoreColor)}>
          {Math.round(score)}%
        </span>
        <span className="text-xs text-muted-foreground">score</span>
      </div>
    </div>
  )
}

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}: {
  result: QuizResultData | null
  hideStartNew?: boolean
  onStartNew: () => void
}) {
  const [showReview, setShowReview] = useState(false)

  if (!result) return null

  const mood = getMood(result.score)
  const config = MOOD_CONFIG[mood]

  const mcqQuestions = result.questions.filter((q) => q.answer !== '')
  const correct = mcqQuestions.filter((q) => q.isCorrect).length
  const openEnded = result.questions.filter((q) => q.answer === '').length

  return (
    <div className="space-y-6 pb-4">
      {/* Hero section */}
      <div
        className={cn(
          'rounded-2xl border p-6 text-center space-y-4 shadow-xl',
          config.bgGlow,
        )}
      >
        <div className="flex flex-col items-center gap-2">
          {config.icon}
          <h2 className="text-2xl font-bold">{config.headline}</h2>
          <p className="text-muted-foreground text-sm max-w-xs">{config.sub}</p>
        </div>

        <div className="flex justify-center">
          <ScoreRing score={result.score} mood={mood} />
        </div>

        {/* Quick stats */}
        <div className="flex justify-center gap-6 text-sm">
          {mcqQuestions.length > 0 && (
            <>
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-semibold text-green-500">{correct}</span>
                <span className="text-muted-foreground text-xs">correct</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-semibold text-rose-500">
                  {mcqQuestions.length - correct}
                </span>
                <span className="text-muted-foreground text-xs">incorrect</span>
              </div>
            </>
          )}
          {openEnded > 0 && (
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-semibold text-blue-400">{openEnded}</span>
              <span className="text-muted-foreground text-xs">open-ended</span>
            </div>
          )}
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-semibold">{result.questions.length}</span>
            <span className="text-muted-foreground text-xs">total</span>
          </div>
        </div>

        {mcqQuestions.length > 0 && (
          <Progress value={result.score} className="h-2 rounded-full" />
        )}
      </div>

      {/* AI Feedback */}
      {result.improvementTip && (
        <div
          className={cn(
            'rounded-xl border p-4 space-y-2',
            config.feedbackBg,
            config.feedbackBorder,
          )}
        >
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm font-semibold">AI Feedback</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.improvementTip}
          </p>
        </div>
      )}

      {/* Question Review toggle */}
      <button
        type="button"
        onClick={() => setShowReview((v) => !v)}
        className="w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <span>Review all questions</span>
        {showReview ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {showReview && (
        <div className="space-y-3">
          {result.questions.map((q, index) => (
            <div
              key={index}
              className={cn(
                'rounded-xl border p-4 space-y-2 text-sm',
                q.answer === ''
                  ? 'border-blue-500/20 bg-blue-500/5'
                  : q.isCorrect
                    ? 'border-green-500/20 bg-green-500/5'
                    : 'border-rose-500/20 bg-rose-500/5',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium leading-snug">{q.question}</p>
                {q.answer === '' ? (
                  <span className="text-xs text-blue-400 shrink-0 mt-0.5 font-medium">open</span>
                ) : q.isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                )}
              </div>

              {q.answer !== '' && (
                <div className="space-y-0.5 text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Your answer:</span>{' '}
                    {q.userAnswer || <span className="italic">no answer</span>}
                  </p>
                  {!q.isCorrect && q.answer && (
                    <p>
                      <span className="font-medium text-green-500">Correct:</span> {q.answer}
                    </p>
                  )}
                </div>
              )}

              {q.explanation && (
                <p className="text-muted-foreground border-t border-border/50 pt-2">
                  {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!hideStartNew && (
        <Button onClick={onStartNew} className="w-full" size="lg">
          Start New Quiz
        </Button>
      )}
    </div>
  )
}
