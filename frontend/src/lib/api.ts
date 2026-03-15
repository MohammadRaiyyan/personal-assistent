import type { APIResponse } from '../../../shared/types/api'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

async function request<T>(path: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    const res = await fetch(`${BASE_URL}${path}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers ?? {}),
        },
        ...options,
    })

    const text = await res.text()
    let data: unknown = undefined
    try {
        data = text ? JSON.parse(text) : undefined
    } catch {
        data = text
    }

    if (!res.ok) {
        const err = new Error(
            (data as Record<string, string>)?.message ?? res.statusText ?? 'Request failed'
        )
        ;(err as Error & { status: number; data: unknown }).status = res.status
        ;(err as Error & { status: number; data: unknown }).data = data
        throw err
    }

    return data as APIResponse<T>
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    patch: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
    del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

export default api
