import z from "zod"

const question = z.object({
    question: z.string(),
    answer: z.string(),
    explanation: z.string().optional(),
})

export const takeAssessmentSchema = z.object({
    category: z.enum(["technical", "behavioral"]),
    difficulty: z.enum(["junior", "mid", "senior", "lead", "staff"]),
    count: z.number().int().min(5).max(20).default(10),
    skillFocus: z.array(z.string()).optional(),
})

export const saveQuizResultSchema = z.object({
    questions: z.array(question),
    answers: z.array(z.string().nullable()),
    industry: z.string(),
    category: z.enum(["technical", "behavioral"]),
    difficulty: z.enum(["junior", "mid", "senior", "lead", "staff"]),
    score: z.number(),
    skillFocus: z.array(z.string()).optional(),
})

export type TakeAssessmentType = z.infer<typeof takeAssessmentSchema>
export type SaveQuizType = z.infer<typeof saveQuizResultSchema>
