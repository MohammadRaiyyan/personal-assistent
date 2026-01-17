import z from "zod"

const question = z.object({
    question: z.string("Question name is required"),
    answer: z.string("Answer name is required"),
    userAnswer: z.string("User answer is required"),
    isCorrect: z.boolean("Answer is required"),
    explanation: z.string("explanation is required")
})

export const saveQuizResultSchema = z.object({
    questions: z.array(question),
    answers: z.array(z.string(), "Answers required"),
    industry: z.string(),
    category: z.enum(["technical", "behavioral"], "Quiz category missing"),
    score: z.number("Score must be provided")
})

export type SaveQuizType = z.infer<typeof saveQuizResultSchema>