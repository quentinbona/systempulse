import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Sample } from '../types/api'
import { percent, time } from '../utils/format'

export default function HistoryChart({ title, field, samples, color }: {
  title: string; field: 'cpu' | 'memory'; samples: Sample[]; color: string
}) {
  const end = samples.at(-1)?.time
  return <article className="panel chart" aria-label={title}>
    <div className="panel-head"><h3>{title}</h3><span className="sub">2 min window</span></div>
    {end !== undefined ? <div className="plot">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={samples} margin={{ top: 8, left: 0, bottom: 0, right: 10 }}>
          <CartesianGrid vertical={false} stroke="#323637" strokeDasharray="3 5" />
          <XAxis type="number" dataKey="time" domain={[end - 120000, end]} allowDataOverflow
            tickFormatter={time} ticks={[end - 120000, end - 60000, end]} tick={{ fill: '#a2aba9' }} tickLine={false} axisLine={false} padding={{left:22,right:22}} />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} unit="%" width={43} tick={{ fill: '#a2aba9' }} tickLine={false} axisLine={false} />
          <Tooltip isAnimationActive={false} labelFormatter={v => time(Number(v))} formatter={v => [percent(Number(v)) + '%', title]}
            contentStyle={{ background: '#1a2021', border: '1px solid #495052' }} />
          <Area type="linear" dataKey={field} stroke={color} strokeWidth={2}
            fill={color} fillOpacity={0.09} isAnimationActive={false} dot={samples.length === 1} />
        </AreaChart>
      </ResponsiveContainer>
    </div> : <div className="emptyplot">Waiting for measurements</div>}
  </article>
}
