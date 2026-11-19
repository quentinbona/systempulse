import { Activity, Clock3, Cpu, Database, HardDrive, LayoutDashboard, MemoryStick, Server } from 'lucide-react'
import { MetricCard } from './components/MetricCard'
import { lazy, Suspense } from 'react'
import { useMetrics } from './hooks/useMetrics'
import { availablePercent } from './utils/storage'
import { bytes, missing, percent, time, uptime } from './utils/format'

const HistoryChart = lazy(() => import('./components/HistoryChart'))

const lime = '#b5e87d'
const blue = '#88b8fd'

export default function App() {
  const { metrics, host, history, status, detail } = useMetrics()
  const cpu = metrics?.cpu
  const memory = metrics?.memory
  const disk = metrics?.disk
  const available = availablePercent(disk)
  const fields = [
    ['Hostname', host?.hostname], ['Operating system', host?.operating_system],
    ['Physical / logical cores', host ? `${host.cpu.physical_cores ?? missing} / ${host.cpu.logical_cores ?? missing}` : undefined],
    ['Boot time', host && new Date(host.boot_timestamp).toLocaleString()],
  ]
  return <div className="shell">
    <aside>
      <h1 className="brand"><span><Activity size={22} /></span>SystemPulse</h1>
      <nav aria-label="Dashboard"><a href="#overview" aria-current="page"><LayoutDashboard size={16} />Overview</a></nav>
      <div className="connection"><div className="caption">API CONNECTION</div>
        <strong className={'status ' + status.toLowerCase()} role="status">{status}</strong>
      </div>
    </aside>
    <main id="overview">
      <header><div className="hostline"><Server size={15}/>{host?.hostname ?? 'Backend host'}</div>
        <div className="titleline"><h2>System overview</h2><div className="updated">Last updated <b>{metrics ? time(metrics.timestamp) : missing}</b></div></div>
      </header>
      {detail && <p className="notice" role="status">{metrics && 'Showing last successful measurements. '}{detail}</p>}
      <section aria-label="Current measurements" className="metrics">
        <MetricCard icon={Cpu} color={lime} label="CPU utilization" value={percent(cpu?.utilization_percent)}
          unit={cpu && '%'} note={cpu ? `${cpu.logical_cores ?? missing} logical cores` : 'Logical cores unavailable'} />
        <MetricCard icon={MemoryStick} color={blue} label="Memory usage" value={percent(memory?.utilization_percent)}
          unit={memory && '%'} note={`${bytes(memory?.used_bytes)} used / ${bytes(memory?.total_bytes)}`} />
        <MetricCard icon={HardDrive} color="#dfb884" label="Storage available" value={percent(available)}
          unit={available !== undefined ? '%' : undefined} note={`${bytes(disk?.free_bytes)} available to host`} />
        <MetricCard icon={Clock3} color="#c5ade3" label="System uptime" value={uptime(host?.uptime_seconds)} note="Since last boot" />
      </section>
      <section><div className="section-head"><h2>Performance history</h2><span className="sub">2s interval · {history.length}/60 samples</span></div>
        <Suspense fallback={<p className="sub">Loading charts…</p>}><div className="pair"><HistoryChart title="CPU utilization" field="cpu" samples={history} color={lime}/>
          <HistoryChart title="Memory utilization" field="memory" samples={history} color={blue}/></div></Suspense>
      </section>
      <section className="pair details" aria-label="Host details">
        <article className="panel detail"><div className="panel-head"><h3>Root filesystem storage</h3><Database size={16}/></div>
          <p className="capacity">{bytes(disk?.total_bytes)} <small>reported capacity</small></p>
          <div className="meter" role="img" aria-label={available !== undefined ? percent(available) + '% of capacity available' : 'Available percentage unknown'}>
            {available !== undefined && <div style={{width: available + '%'}}/>}</div>
          <dl><div><dt>Used by root volume</dt><dd>{bytes(disk?.used_bytes)}</dd></div>
            <div><dt>Available to host</dt><dd>{bytes(disk?.free_bytes)}</dd></div></dl>
          <p className="sub">On APFS, volumes share capacity and available space.</p>
        </article>
        <article className="panel detail"><div className="panel-head"><h3>System information</h3><Server size={16}/></div>
          <dl>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value ?? missing}</dd></div>)}</dl>
        </article>
      </section>
    </main>
  </div>
}
