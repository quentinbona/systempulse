import { expect, it } from 'vitest'
import { availablePercent } from './storage'

const disk = { total_bytes: 1000, used_bytes: 200, free_bytes: 50, utilization_percent: 80 }

it('uses reported capacity as the denominator for available space on shared volumes', () => {
  expect(availablePercent(disk)).toBe(5)
  expect(availablePercent({ ...disk, free_bytes: 0 })).toBe(0)
})

it('leaves the percentage unknown when capacity is missing or zero', () => {
  expect(availablePercent()).toBeUndefined()
  expect(availablePercent({ ...disk, total_bytes: 0 })).toBeUndefined()
})
