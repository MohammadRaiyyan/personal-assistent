import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { saveQuizResult, takeAssessments } from '@/lib/interviewApi'
import type { QuizQuestion, QuizResultData, SaveQuizPayload, UserProfile } from '../../../../../shared/types/api'
import { getRouteApi, useSearch } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import QuizResult from './quiz-result'

type Category = 'technical' | 'behavioral'
type Difficulty = 'junior' | 'mid' | 'senior' | 'lead' | 'staff'

interface QuizConfig {
  category: Category
  difficulty: Difficulty
  count: number
  skillFocus: string[]
}

const appRoute = getRouteApi('/app')

const QUESTION_COUNTS = [5, 10, 15, 20]

const DIFFICULTIES: { value: Difficulty; label: string; sub: string }[] = [
  { value: 'junior', label: 'Junior',         sub: '0–2 yrs experience' },
  { value: 'mid',    label: 'Mid-level',       sub: '2–5 yrs experience' },
  { value: 'senior', label: 'Senior',          sub: '5–8 yrs experience' },
  { value: 'lead',   label: 'Lead / Principal', sub: '8+ yrs experience' },
  { value: 'staff',  label: 'Staff / FAANG',   sub: 'Expert level' },
]

function expToDifficulty(exp: number): Difficulty {
  if (exp < 2) return 'junior'
  if (exp < 5) return 'mid'
  if (exp < 8) return 'senior'
  if (exp < 12) return 'lead'
  return 'staff'
}

export default function Quiz() {
  const profile = appRoute.useLoaderData() as UserProfile | null
  const search = useSearch({ from: '/app/interview/mock' })

  const defaultDifficulty = expToDifficulty(profile?.experience ?? 0)

  const [config, setConfig] = useState<QuizConfig>({
    category: search.category ?? 'technical',
    difficulty: search.difficulty ?? defaultDifficulty,
    count: search.count ?? 10,
    skillFocus: search.skillFocus ? [search.skillFocus] : [],
  })
  const [configDone, setConfigDone] = useState(false)
  const [showDifficultyOverride, setShowDifficultyOverride] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null)
  const [answers, setAnswers] = useState<(string | null)[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [generatingQuiz, setGeneratingQuiz] = useState(false)
  const [resultData, setResultData] = useState<QuizResultData | null>(null)
  const [savingResult, setSavingResult] = useState(false)
  const autoStartFired = useRef(false)

  const saveMutation = useMutation({
    mutationFn: (payload: SaveQuizPayload) => saveQuizResult(payload),
  })

  const generateQuizFn = async (cfg: QuizConfig) => {
    setGeneratingQuiz(true)
    try {
      const res = await takeAssessments({
        category: cfg.category,
        difficulty: cfg.difficulty,
        count: cfg.count,
        skillFocus: cfg.skillFocus.length > 0 ? cfg.skillFocus : undefined,
      })
      setQuizData(res)
      setAnswers(new Array(res.length).fill(null))
    } catch {
      toast.error('Failed to generate quiz. Please try again.')
      setConfigDone(false)
    } finally {
      setGeneratingQuiz(false)
    }
  }

  // Auto-start when coming from a skill card
  useEffect(() => {
    if (search.autoStart && !autoStartFired.current) {
      autoStartFired.current = true
      setConfigDone(true)
      generateQuizFn(config)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleSkill = (skill: string) => {
    setConfig((prev) => ({
      ...prev,
      skillFocus: prev.skillFocus.includes(skill)
        ? prev.skillFocus.filter((s) => s !== skill)
        : [...prev.skillFocus, skill],
    }))
  }

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answer
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (!quizData) return
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowExplanation(false)
    } else {
      finishQuiz()
    }
  }

  const isMCQ = (q: QuizQuestion) => !!(q.options && q.options.length > 0)

  const calculateScore = () => {
    if (!quizData) return 0
    const mcqQ = quizData.filter(isMCQ)
    if (mcqQ.length === 0) return 100
    let correct = 0
    quizData.forEach((q, i) => {
      if (isMCQ(q) && answers[i] === q.correctAnswer) correct++
    })
    return (correct / mcqQ.length) * 100
  }

  const finishQuiz = async () => {
    if (!quizData) return
    const score = calculateScore()
    setSavingResult(true)
    try {
      const payload: SaveQuizPayload = {
        questions: quizData.map((q) => ({
          question: q.question,
          answer: q.correctAnswer ?? '',
          explanation: q.explanation,
        })),
        answers,
        industry: config.category,
        category: config.category,
        difficulty: config.difficulty,
        score,
        skillFocus: config.skillFocus.length > 0 ? config.skillFocus : undefined,
      }
      const saved = await saveMutation.mutateAsync(payload)
      setResultData({
        score: saved.score,
        questions: saved.questions,
        improvementTip: saved.improvementTips?.[0] ?? null,
      })
      toast.success('Quiz saved!')
    } catch {
      setResultData({
        score,
        questions: quizData.map((q, i) => ({
          question: q.question,
          answer: q.correctAnswer ?? '',
          userAnswer: answers[i] ?? '',
          isCorrect: isMCQ(q) ? q.correctAnswer === answers[i] : true,
          explanation: q.explanation,
        })),
        improvementTip: null,
      })
      toast.error("Couldn't save, but here are your scores.")
    } finally {
      setSavingResult(false)
    }
  }

  const startNewQuiz = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setShowExplanation(false)
    setResultData(null)
    setQuizData(null)
    setConfigDone(false)
    setShowDifficultyOverride(false)
    autoStartFired.current = false
  }

  // ── Generating ──────────────────────────────────────────────────────────────
  if (generatingQuiz) {
    const topic = config.skillFocus.length > 0
      ? config.skillFocus.join(', ')
      : config.category

    const diffLabel = DIFFICULTIES.find((d) => d.value === config.difficulty)?.label ?? config.difficulty

    return (
      <Card className="mx-2">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <Spinner />
          <div className="text-center">
            <p className="font-medium">{topic}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {diffLabel} · {config.count} questions
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── Result ──────────────────────────────────────────────────────────────────
  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    )
  }

  // ── Config (Custom Quiz only — skill cards bypass this) ─────────────────────
  if (!configDone) {
    const userSkills = profile?.skills ?? []
    const fromSearch = !!search.skillFocus
    const diffLabel = DIFFICULTIES.find((d) => d.value === config.difficulty)?.label ?? config.difficulty

    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Configure Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Skill Focus */}
          {userSkills.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Skill Focus</Label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setConfig((p) => ({ ...p, skillFocus: [] }))}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    config.skillFocus.length === 0
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  All skills
                </button>
                {userSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      config.skillFocus.includes(skill)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['technical', 'behavioral'] as Category[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setConfig((p) => ({ ...p, category: c }))}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                    config.category === c
                      ? 'border-primary bg-primary/5 font-medium'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {c === 'technical' ? '💻 Technical' : '🎭 Behavioral'}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Questions</Label>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setConfig((p) => ({ ...p, count: n }))}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    config.count === n
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty — collapsed by default, shows smart default */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Difficulty</Label>
              {!fromSearch && (
                <button
                  type="button"
                  onClick={() => setShowDifficultyOverride((v) => !v)}
                  className="text-xs text-primary"
                >
                  {showDifficultyOverride ? 'Use default' : 'Override'}
                </button>
              )}
            </div>

            {showDifficultyOverride || fromSearch ? (
              <div className="flex flex-col gap-1.5">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setConfig((p) => ({ ...p, difficulty: d.value }))}
                    className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                      config.difficulty === d.value
                        ? 'border-primary bg-primary/5 font-medium'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span>{d.label}</span>
                    <span className="text-xs text-muted-foreground">{d.sub}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
                <span className="font-medium">{diffLabel}</span>
                <span className="text-muted-foreground ml-2 text-xs">
                  based on your {profile?.experience ?? 0} yrs experience
                </span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {config.skillFocus.length > 0 && (
            <p className="text-xs text-muted-foreground self-start">
              Focused on: {config.skillFocus.join(', ')} · {DIFFICULTIES.find(d => d.value === config.difficulty)?.label}
            </p>
          )}
          <Button
            onClick={() => { setConfigDone(true); generateQuizFn(config) }}
            className="w-full"
          >
            Generate Quiz
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // ── Questions ───────────────────────────────────────────────────────────────
  if (!quizData) return null

  const question = quizData[currentQuestion]
  const isCurrentMCQ = isMCQ(question)
  const canProceed = isCurrentMCQ ? !!answers[currentQuestion] : true

  return (
    <Card className="mx-2">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-0.5">
              Question {currentQuestion + 1} of {quizData.length}
            </p>
            <div className="w-40 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / quizData.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap justify-end">
            {config.skillFocus.length > 0 && (
              <Badge variant="outline" className="text-[10px]">{config.skillFocus.join(', ')}</Badge>
            )}
            <Badge variant="secondary" className="text-[10px]">{config.category}</Badge>
            <Badge variant="outline" className="text-[10px]">{config.difficulty}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-base font-medium leading-relaxed">{question.question}</p>

        {question.code && (
          <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap">
            <code>{question.code}</code>
          </pre>
        )}

        {isCurrentMCQ ? (
          <RadioGroup
            onValueChange={handleAnswer}
            value={answers[currentQuestion] ?? undefined}
            className="space-y-2"
          >
            {question.options!.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`opt-${i}`} />
                <Label htmlFor={`opt-${i}`} className="cursor-pointer leading-snug">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Open-ended — think it through, then reveal guidance below
            </Label>
            <textarea
              className="w-full min-h-28 rounded-lg border border-border bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Write your answer…"
              value={answers[currentQuestion] ?? ''}
              onChange={(e) => handleAnswer(e.target.value)}
            />
          </div>
        )}

        {showExplanation && (
          <div className="p-4 bg-muted/60 rounded-lg space-y-1.5 border">
            <p className="text-sm font-semibold">
              {isCurrentMCQ ? 'Explanation' : 'What a strong answer looks like'}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">{question.explanation}</p>
            {isCurrentMCQ && question.correctAnswer && (
              <p className="text-sm pt-1">
                <span className="font-medium">Correct: </span>
                <span className="text-green-600 dark:text-green-400">{question.correctAnswer}</span>
              </p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between gap-2">
        {!showExplanation && (
          <Button
            onClick={() => setShowExplanation(true)}
            variant="outline"
            size="sm"
            disabled={isCurrentMCQ && !answers[currentQuestion]}
          >
            {isCurrentMCQ ? 'Explanation' : 'Show Guidance'}
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canProceed || savingResult}
          size="sm"
          className="ml-auto"
        >
          {savingResult
            ? <Spinner />
            : currentQuestion < quizData.length - 1
              ? 'Next →'
              : 'Finish Quiz'}
        </Button>
      </CardFooter>
    </Card>
  )
}
