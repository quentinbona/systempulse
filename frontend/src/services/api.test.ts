import { afterEach, expect, it, vi } from 'vitest'
import { readHost } from './api'

afterEach(() => vi.unstubAllGlobals())

it('reads all three endpoints using the same cancellation signal', async () => {
  const fetch = vi.fn()
  for (const body of [{ status: 'ok' }, { hostname: 'test' }, { timestamp: 'sample' }]) {
    fetch.mockResolvedValueOnce(Response.json(body))
  }
  vi.stubGlobal('fetch', fetch)
  const signal = new AbortController().signal
  expect(await readHost(signal)).toEqual({ host: { hostname: 'test' }, metrics: { timestamp: 'sample' } })
  expect(fetch.mock.calls.map(([url]) => new URL(url).pathname)).toEqual(['/api/health', '/api/system', '/api/metrics'])
  expect(fetch.mock.calls.every(([, options]) => options.signal === signal)).toBe(true)
})

it('rejects a failed endpoint without requesting downstream data', async () => {
  const fetch = vi.fn().mockResolvedValueOnce(Response.json({ status: 'ok' }))
    .mockResolvedValueOnce(new Response(null, { status: 503 }))
  vi.stubGlobal('fetch', fetch)
  await expect(readHost(new AbortController().signal)).rejects.toThrow('HTTP 503 for /system')
  expect(fetch).toHaveBeenCalledTimes(2)
})
