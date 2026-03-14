export type APIResponse<T> = {
    message: string
    data: T
}

export interface UserProfile {
    id: string
    userId: string
    industry: string
    experience: number
    skills: string[]
    bio: string
    country: string | null
    onboarded: boolean
}

export interface SalaryRange {
    role: string
    min: number
    max: number
    median: number
    currency: string
    location: string
}

export interface Insight {
    id: string
    industry: string
    lastUpdated: string
    nextUpdate: string
    marketOutlook: 'negative' | 'stable' | 'positive'
    jobGrowth: number
    demandLevel: 'low' | 'medium' | 'high'
    keySkills: string[]
    salaryRanges: SalaryRange[]
    keyTrends: string[]
    recommendedSkills: string[]
}

export interface CoverLetter {
    id: string
    companyName: string | null
    positionTitle: string | null
    jobDescription: string | null
    content: string
    status: 'draft' | 'reviewed' | 'finalized'
    createdAt: string
    updatedAt: string
}

export interface Resume {
    id: string
    content: string
    userId: string
    title: string | null
    atsScore: number | null
    feedback: string[] | null
    createdAt: string
    updatedAt: string
}

export interface QuizQuestion {
    question: string
    code?: string
    options?: string[]
    correctAnswer?: string
    explanation: string
}

export interface AssessmentQuestion {
    question: string
    answer: string
    userAnswer: string
    isCorrect: boolean
    explanation: string
}

export interface Assessment {
    id: string
    score: number
    category: string
    createdAt: string
    questions: AssessmentQuestion[]
    improvementTips: string[] | null
}

export interface QuizResultData {
    score: number
    questions: AssessmentQuestion[]
    improvementTip: string | null
}

export interface SaveQuizPayload {
    questions: Array<{ question: string; answer: string; explanation: string }>
    answers: Array<string | null>
    industry: string
    category: 'technical' | 'behavioral'
    difficulty: 'junior' | 'mid' | 'senior' | 'lead' | 'staff'
    score: number
}

export interface ImproveResumePayload {
    type: 'experience' | 'project' | 'summary' | 'education'
    content: string
    industry: string
}
