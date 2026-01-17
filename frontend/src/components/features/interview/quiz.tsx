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
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import QuizResult from './quiz-result'

type QuizQuestion = {
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

const dummyQuiz: QuizQuestion[] = [
  {
    question: 'What is React?',
    options: [
      'A library for building user interfaces',
      'A database',
      'A CSS framework',
      'A testing tool',
    ],
    correctAnswer: 'A library for building user interfaces',
    explanation: 'React is a JavaScript library for building user interfaces.',
  },
  {
    question: 'Which hook is used for state management in React?',
    options: ['useState', 'useEffect', 'useContext', 'useReducer'],
    correctAnswer: 'useState',
    explanation:
      'useState is the primary hook for managing state in functional components.',
  },
  {
    question: 'What does JSX stand for?',
    options: [
      'JavaScript XML',
      'Java Syntax Extension',
      'JSON XML',
      'JavaScript Extension',
    ],
    correctAnswer: 'JavaScript XML',
    explanation: 'JSX stands for JavaScript XML, a syntax extension for React.',
  },
  {
    question: 'How do you pass data from parent to child in React?',
    options: ['Props', 'State', 'Context', 'Refs'],
    correctAnswer: 'Props',
    explanation: 'Props are used to pass data from parent to child components.',
  },
  {
    question: 'Which method is used to perform side effects in React?',
    options: ['useEffect', 'useState', 'useMemo', 'useCallback'],
    correctAnswer: 'useEffect',
    explanation:
      'useEffect is used for side effects such as data fetching or subscriptions.',
  },
]

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0)
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null)
  const [answers, setAnswers] = useState<(string | null)[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [generatingQuiz, setGeneratingQuiz] = useState(false)
  const [resultData, setResultData] = useState<any>(null)
  const [savingResult, setSavingResult] = useState(false)

  const generateQuizFn = async () => {
    setGeneratingQuiz(true)
    setTimeout(() => {
      setQuizData(dummyQuiz)
      setAnswers(new Array(dummyQuiz.length).fill(null))
      setGeneratingQuiz(false)
    }, 500)
  }

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.length).fill(null))
    }
  }, [quizData])

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

  const calculateScore = () => {
    if (!quizData) return 0
    let correct = 0
    answers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) {
        correct++
      }
    })
    return (correct / quizData.length) * 100
  }

  const finishQuiz = async () => {
    if (!quizData) return
    const score = calculateScore()
    try {
      setSavingResult(true)
      setTimeout(() => {
        setResultData({ quizData, answers, score })
        setSavingResult(false)
        toast.success('Quiz completed!')
      }, 500)
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  const startNewQuiz = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setShowExplanation(false)
    setResultData(null)
    generateQuizFn()
  }

  if (generatingQuiz) {
    return <Spinner className="mt-4" width={'100%'} color="gray" />
  }

  // Show results if quiz is completed
  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    )
  }

  if (!quizData) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Ready to test your knowledge?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This quiz contains 5 questions about React. Take your time and
            choose the best answer for each question.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={generateQuizFn} className="w-full">
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const question = quizData[currentQuestion]

  return (
    <Card className="mx-2">
      <CardHeader>
        <CardTitle>
          Question {currentQuestion + 1} of {quizData.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium">{question.question}</p>
        <RadioGroup
          onValueChange={handleAnswer}
          value={answers[currentQuestion]}
          className="space-y-2"
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="font-medium">Explanation:</p>
            <p className="text-muted-foreground">{question.explanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!showExplanation && (
          <Button
            onClick={() => setShowExplanation(true)}
            variant="outline"
            disabled={!answers[currentQuestion]}
          >
            Show Explanation
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion] || savingResult}
          className="ml-auto"
        >
          {savingResult && (
            <Spinner className="mt-4" width={'100%'} color="gray" />
          )}
          {currentQuestion < quizData.length - 1
            ? 'Next Question'
            : 'Finish Quiz'}
        </Button>
      </CardFooter>
    </Card>
  )
}
