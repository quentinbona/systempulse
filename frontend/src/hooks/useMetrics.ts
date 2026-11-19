import { useEffect, useState } from 'react'
import { readHost } from '../services/api'
import type { Host, Metrics, Sample } from '../types/api'

type Status = 'Loading' | 'Connected' | 'Stale' | 'Error' | 'Disconnected'
interface Monitor {
  status: Status
  detail: string
  host?: Host
  metrics?: Metrics
  history: Sample[]
}

export function useMetrics() {
  const [state, setState] = useState<Monitor>({ status: 'Loading', detail: '', history: [] })
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    let deadline: ReturnType<typeof setTimeout>
    let active: AbortController | undefined
    let disposed = false
    let failures = 0
    async function poll() {
      if (disposed || document.hidden || active) return
      const request = new AbortController()
      active = request
      deadline = setTimeout(() => request.abort(), 5000)
      const start = performance.now()
      try {
        const { host, metrics } = await readHost(request.signal)
        if (active !== request || request.signal.aborted) return
        failures = 0
        const sample = { time: Date.parse(metrics.timestamp), cpu: metrics.cpu.utilization_percent,
          memory: metrics.memory.utilization_percent }
        setState(previous => ({
          status: 'Connected', detail: '', host, metrics,
          history: [...previous.history.slice(-59), sample],
        }))
      } catch (error) {
        if (active !== request) return
        const firstFailure = ++failures === 1
        const offline = error instanceof TypeError || request.signal.aborted
        const detail = offline ? 'Backend unreachable. Retrying automatically.' :
          `${error instanceof Error ? error.message : 'Request failed.'} Retrying automatically.`
        setState(previous => ({ ...previous, detail,
          status: previous.metrics && firstFailure ? 'Stale' : offline ? 'Disconnected' : 'Error' }))
      } finally {
        if (active === request) {
          clearTimeout(deadline)
          active = undefined
          timer = setTimeout(poll, Math.max(100, 2000 - (performance.now() - start)))
        }
      }
    }
    function cancel() {
      clearTimeout(timer)
      clearTimeout(deadline)
      active?.abort()
      active = undefined
    }
    function visibilityChanged() {
      if (!document.hidden) { void poll(); return }
      cancel()
      setState(previous => previous.metrics ? { ...previous, status: 'Stale',
        detail: 'Polling paused while the page is hidden.' } : previous)
    }
    void poll()
    document.addEventListener('visibilitychange', visibilityChanged)
    return () => {
      disposed = true
      cancel()
      document.removeEventListener('visibilitychange', visibilityChanged)
    }
  }, [])
  return state
}
