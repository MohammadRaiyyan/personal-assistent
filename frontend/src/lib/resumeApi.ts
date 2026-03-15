import type { ImproveResumePayload, Resume } from '../../../shared/types/api'
import { api } from './api'

export async function getResumes(): Promise<Resume[]> {
    const res = await api.get<Resume[]>('/api/resume/')
    return res.data
}

export async function getResume(id: string): Promise<Resume> {
    const res = await api.get<Resume>(`/api/resume/${id}`)
    return res.data
}

export async function createResume(payload: { content: string; title?: string }): Promise<Resume> {
    const res = await api.post<Resume>('/api/resume/', payload)
    return res.data
}

export async function updateResume(id: string, payload: { content?: string; title?: string }): Promise<Resume> {
    const res = await api.patch<Resume>(`/api/resume/${id}`, payload)
    return res.data
}

export async function duplicateResume(id: string): Promise<Resume> {
    const res = await api.post<Resume>(`/api/resume/${id}/duplicate`, {})
    return res.data
}

export async function deleteResume(id: string): Promise<void> {
    await api.del<void>(`/api/resume/${id}`)
}

export async function improveResume(payload: ImproveResumePayload): Promise<string> {
    const res = await api.post<string>('/api/resume/improve-resume', payload)
    return res.data
}

export default { getResumes, getResume, createResume, updateResume, duplicateResume, deleteResume, improveResume }
