import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import HistoryChart from './HistoryChart'

// JSDOM has no layout engine. Supply dimensions to the real Recharts plot.
vi.mock('recharts', async importOriginal => {
  const charts = await importOriginal<typeof import('recharts')>()
  const { cloneElement } = await import('react')
  return { ...charts, ResponsiveContainer: ({ children }: {
    children: ReactElement<{ width: number; height: number }>
  }) => cloneElement(children, { width: 400, height: 200 }) }
})
afterEach(cleanup)

it('plots CPU and memory from their respective samples', () => {
  const samples = [
    { time: 120000, cpu: 10, memory: 90 },
    { time: 240000, cpu: 80, memory: 20 },
  ]
  const { container, rerender } = render(<HistoryChart title="CPU" field="cpu" samples={samples} color="green" />)
  function line() {
    const path = container.querySelector('.recharts-area-curve')?.getAttribute('d')
    const points = path?.match(/^M([\d.]+),([\d.]+)L([\d.]+),([\d.]+)$/)
    if (!points) throw new Error('Expected two measured chart points: ' + path)
    const [, x1, y1, x2, y2] = points.map(Number)
    expect(x2).toBeGreaterThan(x1)
    return y2 - y1
  }
  expect(line()).toBeLessThan(0)
  rerender(<HistoryChart title="Memory" field="memory" samples={samples} color="blue" />)
  expect(line()).toBeGreaterThan(0)
})
