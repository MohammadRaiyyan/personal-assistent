import type { CoverLetter } from '../../../shared/types/api'
import { api } from './api'

export async function getCoverLetters(): Promise<CoverLetter[]> {
    const res = await api.get<CoverLetter[]>('/api/cover-letter/')
    return res.data
}

export async function getCoverLetter(id: string): Promise<CoverLetter> {
    const res = await api.get<CoverLetter>(`/api/cover-letter/${id}`)
    return res.data
}

export async function createCoverLetter(payload: {
    companyName: string
    positionTitle: string
    jobDescription: string
}): Promise<CoverLetter> {
    const res = await api.post<CoverLetter>('/api/cover-letter/', payload)
    return res.data
}

export async function deleteCoverLetter(id: string): Promise<void> {
    await api.del<void>(`/api/cover-letter/${id}`)
}

export default { getCoverLetters, getCoverLetter, createCoverLetter, deleteCoverLetter }
