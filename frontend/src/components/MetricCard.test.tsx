import { render, screen } from '@testing-library/react'
import { Cpu } from 'lucide-react'
import { expect, it } from 'vitest'
import { bytes, percent, uptime } from '../utils/format'
import { MetricCard } from './MetricCard'

it('renders the measured value, unit and core count', () => {
  render(<MetricCard icon={Cpu} label="CPU utilization" value={percent(12.34)} unit="%" note="8 logical cores" color="green" />)
  const card = screen.getByRole('article')
  expect(card.textContent).toContain('12.3%')
  expect(card.textContent).toContain('8 logical cores')
  expect(screen.getByRole('heading').textContent).toBe('CPU utilization')
})

it('distinguishes zero and missing measurements and formats binary capacity and elapsed days', () => {
  expect(bytes(0)).toBe('0 B')
  expect(bytes(1536)).toBe((1.5).toLocaleString() + ' KiB')
  expect(percent(0)).toBe('0.0')
  expect(percent()).toBe('—')
  expect(uptime(50 * 86400 + 3600)).toBe('50d 1h')
})
