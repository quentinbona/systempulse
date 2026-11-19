export const missing = '—'
export const percent = (n?: number) => n === undefined ? missing : n.toFixed(1)
export function bytes(n?: number) {
  if (n === undefined) return missing
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
  const i = Math.min(units.length - 1, Math.max(0, Math.floor(Math.log2(n || 1) / 10)))
  return (n / 1024 ** i).toLocaleString(undefined, { maximumFractionDigits: 1 }) + ' ' + units[i]
}
export function uptime(n?: number) {
  if (n === undefined) return missing
  const minutes = Math.floor(n / 60)
  const hours = Math.floor(minutes / 60)
  if (hours >= 24) return Math.floor(hours / 24) + 'd ' + hours % 24 + 'h'
  if (hours) return hours + 'h ' + minutes % 60 + 'm'
  return minutes + 'm ' + n % 60 + 's'
}
const clock = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
export const time = (stamp: string | number) => clock.format(new Date(stamp))
