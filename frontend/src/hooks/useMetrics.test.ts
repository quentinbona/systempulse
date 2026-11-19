import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { readHost } from '../services/api'
import { useMetrics } from './useMetrics'

vi.mock('../services/api')
const read = vi.mocked(readHost)
function snapshot(n = 1): Awaited<ReturnType<typeof readHost>> {
  const timestamp = new Date(n * 2000).toISOString()
  const hardware = { physical_cores: 2, logical_cores: 4, frequency_mhz: null }
  return {
    host: { hostname: 'test', operating_system: 'TestOS', uptime_seconds: n,
      boot_timestamp: new Date(0).toISOString(), timestamp, cpu: hardware },
    metrics: { timestamp, cpu: { ...hardware, timestamp, utilization_percent: n },
      memory: { total_bytes: 100, used_bytes: 10, available_bytes: 90, utilization_percent: 10 },
      disk: { total_bytes: 100, used_bytes: 5, free_bytes: 95, utilization_percent: 5 } },
  }
}
const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms) })
function hidden(value: boolean) {
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(value)
  act(() => { document.dispatchEvent(new Event('visibilitychange')) })
}
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
  read.mockReset().mockResolvedValue(snapshot())
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

it('starts loading and polls every two seconds with bounded CPU and memory history', async () => {
  let n = 0
  read.mockImplementation(async () => snapshot(++n))
  const { result } = renderHook(useMetrics)
  expect(result.current.status).toBe('Loading')
  await advance(1999)
  expect(read).toHaveBeenCalledTimes(1)
  expect(result.current.status).toBe('Connected')
  await advance(1)
  expect(read).toHaveBeenCalledTimes(2)
  await advance(118000)
  expect(result.current.history).toHaveLength(60)
  expect(result.current.history[0]).toEqual({ time: 4000, cpu: 2, memory: 10 })
  expect(result.current.history.at(-1)?.cpu).toBe(61)
})

it('retains a stale snapshot through disconnection and resumes on success', async () => {
  read.mockResolvedValueOnce(snapshot()).mockRejectedValueOnce(new TypeError('offline'))
    .mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce(snapshot(2))
  const { result } = renderHook(useMetrics)
  await advance(0)
  const original = result.current.metrics
  await advance(2000)
  expect(result.current.status).toBe('Stale')
  await advance(2000)
  expect(result.current.status).toBe('Disconnected')
  expect(result.current.metrics).toBe(original)
  expect(result.current.history).toHaveLength(1)
  await advance(2000)
  expect(result.current.status).toBe('Connected')
  expect(result.current.history).toHaveLength(2)
})

it('reports an initial server error and retries', async () => {
  read.mockRejectedValueOnce(new Error('HTTP 503'))
  const { result } = renderHook(useMetrics)
  await advance(0)
  expect(result.current.status).toBe('Error')
  expect(result.current.detail).toContain('HTTP 503')
  await advance(2000)
  expect(result.current.status).toBe('Connected')
})

it('times out a stalled request without overlapping polls and retries', async () => {
  read.mockImplementationOnce(signal => new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason))
  }))
  const { result } = renderHook(useMetrics)
  await advance(4999)
  expect(read).toHaveBeenCalledTimes(1)
  expect(read.mock.calls[0][0].aborted).toBe(false)
  await advance(1)
  expect(read.mock.calls[0][0].aborted).toBe(true)
  expect(result.current.status).toBe('Disconnected')
  await advance(100)
  expect(result.current.status).toBe('Connected')
})

it('pauses while hidden, resumes immediately and ignores obsolete completions', async () => {
  hidden(true)
  let finish!: (value: ReturnType<typeof snapshot>) => void
  read.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
  const { result } = renderHook(useMetrics)
  await advance(10000)
  expect(read).not.toHaveBeenCalled()
  hidden(false)
  hidden(true)
  expect(read.mock.calls[0][0].aborted).toBe(true)
  await advance(10000)
  expect(read).toHaveBeenCalledTimes(1)
  hidden(false)
  await advance(0)
  await act(async () => { finish(snapshot(9)) })
  expect(result.current.history.map(s => s.cpu)).toEqual([1])
  hidden(true)
  expect(result.current.status).toBe('Stale')
  await advance(4000)
  expect(read).toHaveBeenCalledTimes(2)
})

it('releases deadlines, requests and visibility listeners on unmount', async () => {
  read.mockImplementation(() => new Promise(() => {}))
  const { unmount } = renderHook(useMetrics)
  unmount()
  expect(read.mock.calls[0][0].aborted).toBe(true)
  expect(vi.getTimerCount()).toBe(0)
  hidden(true)
  hidden(false)
  await advance(10000)
  expect(read).toHaveBeenCalledTimes(1)
})
