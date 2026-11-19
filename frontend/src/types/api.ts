export interface Health { status: 'ok' }
export interface Hardware {
  physical_cores: number | null
  logical_cores: number | null
  frequency_mhz: number | null
}
interface Capacity {
  total_bytes: number
  used_bytes: number
  utilization_percent: number
}
export interface Metrics {
  timestamp: string
  cpu: Hardware & { timestamp: string; utilization_percent: number }
  memory: Capacity & { available_bytes: number }
  disk: Capacity & { free_bytes: number }
}
export interface Host {
  hostname: string
  operating_system: string
  uptime_seconds: number
  boot_timestamp: string
  timestamp: string
  cpu: Hardware
}
export interface Sample { time: number; cpu: number; memory: number }
