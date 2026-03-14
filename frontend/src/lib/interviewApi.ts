import type { Assessment, QuizQuestion, SaveQuizPayload } from '../../../shared/types/api'
import { api } from './api'

export async function getAssessments(): Promise<Assessment[]> {
    const res = await api.get<Assessment[]>('/api/interview/assessments')
    return res.data
}

export async function takeAssessments(payload: { category: 'technical' | 'behavioral'; difficulty: 'junior' | 'mid' | 'senior' | 'lead' | 'staff'; count: number }): Promise<QuizQuestion[]> {
    const res = await api.post<QuizQuestion[]>('/api/interview/take-assessments', payload)
    return res.data
}

export async function saveQuizResult(payload: SaveQuizPayload): Promise<Assessment> {
    const res = await api.post<Assessment>('/api/interview/save-results', payload)
    return res.data
}

export default { getAssessments, takeAssessments, saveQuizResult }
