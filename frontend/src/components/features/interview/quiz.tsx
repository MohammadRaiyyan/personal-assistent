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
import type { QuizQuestion, QuizResultData, SaveQuizPayload } from '../../../../../shared/types/api'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import QuizResult from './quiz-result'

type Category = 'technical' | 'behavioral'
type Difficulty = 'junior' | 'mid' | 'senior' | 'lead' | 'staff'

interface QuizConfig {
  category: Category
  difficulty: Difficulty
  count: number
}

const QUESTION_COUNTS = [5, 10, 15, 20]

const CATEGORIES: { value: Category; label: string; description: string }[] = [
  { value: 'technical', label: 'Technical', description: 'Coding, system design, architecture' },
  { value: 'behavioral', label: 'Behavioral', description: 'Situational, leadership, STAR format' },
]

const DIFFICULTIES: { value: Difficulty; label: string; badge: string }[] = [
  { value: 'junior', label: 'Junior', badge: '0–2 yrs' },
  { value: 'mid', label: 'Mid-level', badge: '2–5 yrs' },
  { value: 'senior', label: 'Senior', badge: '5–8 yrs' },
  { value: 'lead', label: 'Lead / Principal', badge: '8+ yrs' },
  { value: 'staff', label: 'Staff / FAANG', badge: 'Expert' },
]

export default function Quiz() {
  const [config, setConfig] = useState<QuizConfig>({ category: 'technical', difficulty: 'mid', count: 10 })
  const [configDone, setConfigDone] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null)
  const [answers, setAnswers] = useState<(string | null)[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [generatingQuiz, setGeneratingQuiz] = useState(false)
  const [resultData, setResultData] = useState<QuizResultData | null>(null)
  const [savingResult, setSavingResult] = useState(false)

  const takeMutation = useMutation({ mutationFn: () => takeAssessments({ category: config.category, difficulty: config.difficulty, count: config.count }) })
  const saveMutation = useMutation({
    mutationFn: (payload: SaveQuizPayload) => saveQuizResult(payload),
  })

  const generateQuizFn = async () => {
    setGeneratingQuiz(true)
    try {
      const res = await takeMutation.mutateAsync()
      setQuizData(res)
      setAnswers(new Array(res.length).fill(null))
    } catch {
      toast.error('Failed to generate quiz. Please try again.')
      setConfigDone(false)
    } finally {
      setGeneratingQuiz(false)
    }
  }

  const handleStartQuiz = () => {
    setConfigDone(true)
    generateQuizFn()
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
    const mcqQuestions = quizData.filter(isMCQ)
    if (mcqQuestions.length === 0) return 100
    let correct = 0
    quizData.forEach((q, index) => {
      if (isMCQ(q) && answers[index] === q.correctAnswer) correct++
    })
    return (correct / mcqQuestions.length) * 100
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
      }
      const saved = await saveMutation.mutateAsync(payload)
      setResultData({
        score: saved.score,
        questions: saved.questions,
        improvementTip: saved.improvementTips?.[0] ?? null,
      })
      toast.success('Quiz completed!')
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
      toast.error('Could not save results, but here are your scores.')
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
  }

  if (generatingQuiz) {
    return (
      <Card className="mx-2">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner />
          <p className="text-muted-foreground text-sm">Generating your {config.difficulty}-level {config.category} quiz…</p>
        </CardContent>
      </Card>
    )
  }

  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    )
  }

  // Config step
  if (!configDone) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Configure your quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, category: c.value }))}
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    config.category === c.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <p className="font-medium">{c.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Number of questions</Label>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, count: n }))}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    config.count === n
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Difficulty / Target level</Label>
            <div className="flex flex-col gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, difficulty: d.value }))}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                    config.difficulty === d.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <span className="font-medium text-sm">{d.label}</span>
                  <Badge variant="secondary">{d.badge}</Badge>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartQuiz} className="w-full">
            Generate Quiz
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (!quizData) return null

  const question = quizData[currentQuestion]
  const isCurrentMCQ = isMCQ(question)
  const canProceed = isCurrentMCQ ? !!answers[currentQuestion] : true

  return (
    <Card className="mx-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Question {currentQuestion + 1} of {quizData.length}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{config.category}</Badge>
            <Badge variant="secondary">{config.difficulty}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium">{question.question}</p>

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
            {question.options!.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Your answer (open-ended — think through it before revealing guidance)</Label>
            <textarea
              className="w-full min-h-30 rounded-lg border border-border bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Type your answer here…"
              value={answers[currentQuestion] ?? ''}
              onChange={(e) => handleAnswer(e.target.value)}
            />
          </div>
        )}

        {showExplanation && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-1">
            <p className="font-medium">{isCurrentMCQ ? 'Explanation' : 'Strong answer guidance'}:</p>
            <p className="text-muted-foreground text-sm">{question.explanation}</p>
            {isCurrentMCQ && question.correctAnswer && (
              <p className="text-sm mt-1">
                <span className="font-medium">Correct answer: </span>
                <span className="text-green-600 dark:text-green-400">{question.correctAnswer}</span>
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!showExplanation && (
          <Button
            onClick={() => setShowExplanation(true)}
            variant="outline"
            disabled={isCurrentMCQ && !answers[currentQuestion]}
          >
            {isCurrentMCQ ? 'Show Explanation' : 'Show Guidance'}
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canProceed || savingResult}
          className="ml-auto"
        >
          {savingResult ? <Spinner /> : currentQuestion < quizData.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      </CardFooter>
    </Card>
  )
}
