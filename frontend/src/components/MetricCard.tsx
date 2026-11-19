import type { LucideIcon } from 'lucide-react'
export function MetricCard({ icon: Icon, label, value, unit, note, color }: {
  icon: LucideIcon; label: string; value: string; unit?: string; note: string; color: string
}) {
  return <article className="panel metric">
    <div className="flex items-center gap-2"><Icon size={17} color={color} /><h3>{label}</h3></div>
    <p className="reading">{value}<small>{unit}</small></p>
    <p className="sub">{note}</p>
  </article>
}
