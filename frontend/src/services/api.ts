import type { Health, Host, Metrics } from '../types/api'

const base = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '')

async function get<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(base + path, { signal, cache: 'no-store' })
  if (!response.ok) throw new Error(`API returned HTTP ${response.status} for ${path}.`)
  return response.json()
}

export async function readHost(signal: AbortSignal) {
  const health = await get<Health>('/health', signal)
  if (health.status !== 'ok') throw new Error('Backend health check failed.')
  const host = await get<Host>('/system', signal)
  const metrics = await get<Metrics>('/metrics', signal)
  return { host, metrics }
}
