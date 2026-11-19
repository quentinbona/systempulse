import type { Metrics } from '../types/api'

export function availablePercent(disk?: Metrics['disk']): number | undefined {
  if (!disk || disk.total_bytes === 0) return undefined
  return 100 * disk.free_bytes / disk.total_bytes
}
