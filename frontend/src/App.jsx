import { useState, useEffect, useCallback } from 'react'
import ReactECharts from 'echarts-for-react'
import axios from 'axios'
import dayjs from 'dayjs'
import './App.css'

/* ─────────────────────────────────────────
   Config
───────────────────────────────────────── */
const API      = '/api/dashboard'
const POLL_MS  = 30_000          // auto-refresh every 30 seconds

/* ─────────────────────────────────────────
   Tiny inline-SVG icon helper (Feather-style)
───────────────────────────────────────── */
const PATHS = {
  activity : 'M22 12h-4l-3 9L9 3l-3 9H2',
  clock    : 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2M12 6v6l4 2',
  zap      : 'M13 2 3 14h9l-1 8 10-12h-9z',
  check    : 'M20 6 9 17l-5-5',
  x        : 'M18 6 6 18M6 6l12 12',
  layers   : 'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  cpu      : 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 0-2-2V9m0 0h18',
  play     : 'M5 3l14 9-14 9V3z',
  settings : 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z',
  refresh  : 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  alert    : 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',
  grid     : 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',
  database : 'M12 2C6.48 2 2 4.69 2 8s4.48 6 10 6 10-2.69 10-6-4.48-6-10-6zM2 12c0 3.31 4.48 6 10 6s10-2.69 10-6M2 16c0 3.31 4.48 6 10 6s10-2.69 10-6',
}

const Ico = ({ name, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={PATHS[name]} />
  </svg>
)

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const fmt      = n  => (n != null ? Number(n).toLocaleString() : '—')
const fmtDT    = dt => dt ? dayjs(dt).format('YYYY-MM-DD HH:mm:ss') : '—'
const clamp    = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

/** Seed 15 historical points so chart shows immediately on first load */
function seedHistory(cardsBase, pendingBase) {
  return Array.from({ length: 15 }, (_, i) => ({
    time    : dayjs().subtract((14 - i) * 2, 'minute').format('HH:mm'),
    cards   : Math.round(cardsBase * (0.75 + Math.random() * 0.5)),
    pending : Math.round(pendingBase * (0.6 + Math.random() * 0.8)),
  }))
}

/* ─────────────────────────────────────────
   Main App
───────────────────────────────────────── */
export default function App() {
  const [flags,       setFlags]       = useState(null)
  const [summary,     setSummary]     = useState(null)
  const [engines,     setEngines]     = useState([])
  const [failed,      setFailed]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [history,     setHistory]     = useState([])

  /* ── Fetch all data ── */
  const fetchAll = useCallback(async () => {
    try {
      const [f, s, e, fr] = await Promise.all([
        axios.get(`${API}/migration-flags`),
        axios.get(`${API}/request-summary`),
        axios.get(`${API}/engine-status`),
        axios.get(`${API}/failed-requests`),
      ])

      setFlags(f.data)
      setSummary(s.data)
      setEngines(e.data || [])
      setFailed(fr.data || [])
      setLastRefresh(new Date())
      setError(null)

      /* Append new data point to rolling chart history */
      const cardsBase   = e.data?.[0]?.cardsProcessedPerRun ?? 300
      const pendingNow  = (s.data?.pending?.replacement ?? 0) + (s.data?.pending?.productChange ?? 0)

      setHistory(prev => {
        const seed    = prev.length === 0 ? seedHistory(cardsBase, pendingNow || 80) : prev
        const point   = { time: dayjs().format('HH:mm'), cards: cardsBase, pending: pendingNow }
        return [...seed, point].slice(-20)
      })
    } catch {
      setError('Cannot reach backend. Make sure Spring Boot is running on port 8080.')
    } finally {
      setLoading(false)
    }
  }, [])

  /* ── Polling: fetch on mount + every 30 s ── */
  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, POLL_MS)
    return () => clearInterval(id)
  }, [fetchAll])

  /* ── Derived values ── */
  const engine        = engines[0] ?? {}
  const totalPending  = (summary?.pending?.replacement   ?? 0) + (summary?.pending?.productChange   ?? 0)
  const totalProc     = (summary?.processed?.replacement ?? 0) + (summary?.processed?.productChange ?? 0)
  const totalComp     = (summary?.completed?.replacement ?? 0) + (summary?.completed?.productChange ?? 0)
  const totalFailed   = (summary?.failed?.replacement    ?? 0) + (summary?.failed?.productChange    ?? 0)

  const threadPct = engine.threads
    ? clamp(Math.round((engine.threads / 20) * 100), 0, 100)
    : 0
  const batchPct  = engine.batchSize && engine.cardsProcessedPerRun
    ? clamp(Math.round((engine.cardsProcessedPerRun / engine.batchSize) * 100), 0, 100)
    : 0
  const queuePct  = (totalPending + totalComp) > 0
    ? clamp(Math.round((totalPending / (totalPending + totalComp)) * 100), 0, 100)
    : 0

  /* ── ECharts option ── */
  const chartOpt = {
    backgroundColor: 'transparent',
    grid: { top: 16, right: 20, bottom: 36, left: 52, containLabel: false },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1a3a5c',
      borderColor: '#1a3a5c',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: params => {
        const t = params[0]?.axisValue ?? ''
        return params.map(p =>
          `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:5px"></span>${p.seriesName}: <b>${Number(p.value).toLocaleString()}</b>`
        ).join('<br/>') + `<br/><small style="color:#94a3b8">${t}</small>`
      },
    },
    xAxis: {
      type: 'category',
      data: history.map(h => h.time),
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    series: [
      {
        name: 'Cards Processed',
        type: 'line', smooth: true, symbol: 'none',
        data: history.map(h => h.cards),
        lineStyle: { color: '#0ea5e9', width: 2.5 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(14,165,233,.18)' },
              { offset: 1, color: 'rgba(14,165,233,0)' },
            ],
          },
        },
      },
      {
        name: 'Pending',
        type: 'line', smooth: true, symbol: 'none',
        data: history.map(h => h.pending),
        lineStyle: { color: '#f59e0b', width: 2.5 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245,158,11,.14)' },
              { offset: 1, color: 'rgba(245,158,11,0)' },
            ],
          },
        },
      },
    ],
  }

  /* ── Card definitions ── */
  const flagCards = [
    { label: 'Flag 0', sub: 'Normal',          value: flags?.flag0, icon: 'grid',     color: 'c-blue'  },
    { label: 'Flag 1', sub: 'Initiated',        value: flags?.flag1, icon: 'activity', color: 'c-blue'  },
    { label: 'Flag 2', sub: 'Pending',          value: flags?.flag2, icon: 'zap',      color: 'c-amber' },
    { label: 'Flag 3', sub: 'Completed',        value: flags?.flag3, icon: 'check',    color: 'c-green' },
    { label: 'Flag 4', sub: 'Failed/Rejected',  value: flags?.flag4, icon: 'x',        color: 'c-red'   },
  ]

  const reqCards = [
    { label: 'Pending Requests',   sub: 'Awaiting processing',    value: totalPending, icon: 'clock',    color: 'c-blue'  },
    { label: 'Processed Requests', sub: 'In progress or queued',  value: totalProc,    icon: 'zap',      color: 'c-blue'  },
    { label: 'Completed Requests', sub: 'Successfully completed', value: totalComp,    icon: 'check',    color: 'c-green' },
    { label: 'Failed / Rejected',  sub: 'Failed or rejected',     value: totalFailed,  icon: 'x',        color: 'c-red'   },
  ]

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="dashboard-wrapper">
      <div style={{ paddingTop: 40 }}>
        <div className="skel" style={{ height: 56, borderRadius: 12, marginBottom: 32 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skel" style={{ height: 88, borderRadius: 12 }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skel" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      </div>
    </div>
  )

  /* ── Dashboard ── */
  return (
    <div className="dashboard-wrapper">

      {/* Header */}
      <header className="dash-header">
        <div className="dash-header-left">
          <div className="dash-logo">
            <Ico name="activity" size={22} />
          </div>
          <div>
            <div className="dash-title">Migration Service</div>
            <div className="dash-subtitle">Card Migration Engine · DFCC Bank</div>
          </div>
        </div>
        <div className="dash-header-right">
          <div className="refresh-chip">
            <div className="refresh-dot" />
            {lastRefresh ? `Updated ${dayjs(lastRefresh).format('HH:mm:ss')}` : 'Loading…'}
          </div>
          <button className="icon-btn" title="Refresh now" onClick={fetchAll}>
            <Ico name="refresh" size={16} />
          </button>
          <button className="icon-btn" title="Settings">
            <Ico name="settings" size={16} />
          </button>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="err-banner">
          <Ico name="alert" size={16} />
          {error}
        </div>
      )}

      {/* ── Cards per Migration Flag ── */}
      <section className="section">
        <div className="section-title">Cards per Migration Flag</div>
        <div className="flag-grid">
          {flagCards.map(c => <StatCard key={c.label} {...c} />)}
        </div>
      </section>

      {/* ── Request Statistics ── */}
      <section className="section">
        <div className="section-title">Request Statistics</div>
        <div className="req-grid">
          {reqCards.map(c => <StatCard key={c.label} {...c} />)}
        </div>
      </section>

      {/* ── Engine Performance ── */}
      <section className="section">
        <div className="section-title">Migration Service Engine Performance</div>
        <div className="engine-grid">
          {/* Row 1 */}
          <EngineCard icon="activity" label="Engine Status">
            <div className="status-badge">
              <div className={`status-dot ${engine.status === 'RUNNING' ? 'dot-running' : 'dot-stopped'}`} />
              {engine.status || '—'}
            </div>
            {engine.engineId && (
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{engine.engineId}</div>
            )}
          </EngineCard>

          <EngineCard icon="clock" label="Last Execution Timestamp">
            <div className="engine-val">{fmtDT(engine.lastExecution)}</div>
          </EngineCard>

          <EngineCard icon="play" label="Next Scheduled Run">
            <div className="engine-val">{fmtDT(engine.nextExecution)}</div>
          </EngineCard>

          {/* Row 2 */}
          <EngineCard icon="layers" label="Cards Processed per Run">
            <div className="engine-val-lg">{fmt(engine.cardsProcessedPerRun)}</div>
          </EngineCard>

          <EngineCard icon="clock" label="Average Processing Time">
            <div className="engine-val-lg">
              {engine.avgProcessingTime != null
                ? `${Number(engine.avgProcessingTime).toFixed(2)} sec/card`
                : '—'}
            </div>
          </EngineCard>

          <EngineCard icon="cpu" label="Parallel Threads">
            <div className="engine-val-lg">
              {engine.threads != null ? `${engine.threads} threads` : '—'}
            </div>
          </EngineCard>
        </div>
      </section>

      {/* ── Performance Timeline ── */}
      <section className="section">
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">Performance Metrics Timeline</div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-line" style={{ background: '#0ea5e9' }} />
                Cards Processed
              </div>
              <div className="legend-item">
                <div className="legend-line" style={{ background: '#f59e0b' }} />
                Pending
              </div>
            </div>
          </div>
          {history.length > 1
            ? <ReactECharts option={chartOpt} style={{ height: 230 }} notMerge />
            : (
              <div style={{ height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                Collecting data points…
              </div>
            )
          }
        </div>
      </section>

      {/* ── Bottom row: Monitoring Period + System Status ── */}
      <div className="bottom-row">
        <div className="info-card">
          <div className="info-label">Monitoring Period</div>
          <div className="info-title">Today (Last 24 hours)</div>
          <div className="info-meta">
            Start: {dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss')}<br />
            End: &nbsp; {dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')}
          </div>
        </div>

        <div className="info-card">
          <div className="info-label" style={{ marginBottom: 14 }}>System Status</div>
          <ProgressRow label="Thread Utilization" pct={threadPct} color="var(--success)" />
          <ProgressRow label="Batch Load"          pct={batchPct}  color="var(--success)" />
          <ProgressRow label="Queue Depth"         pct={queuePct}  color="var(--warning)" />
        </div>
      </div>

      {/* ── Failed Requests Table ── */}
      {failed.length > 0 && (
        <section className="section" style={{ marginTop: 14 }}>
          <div className="table-card">
            <div className="table-head">
              <div className="table-ttl">Failed / Rejected Requests</div>
              <div className="badge">{failed.length} record{failed.length !== 1 ? 's' : ''}</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="dtable">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Card Number</th>
                    <th>Reason Code</th>
                    <th>Reject Remark</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {failed.slice(0, 15).map((r, i) => (
                    <tr key={r.requestId ?? i}>
                      <td>
                        <code style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                          {r.requestId ?? '—'}
                        </code>
                      </td>
                      <td>{r.cardNumber ?? '—'}</td>
                      <td>
                        {r.reason
                          ? <span className={`pill ${r.reason.toUpperCase().startsWith('CR') ? 'pill-blue' : 'pill-red'}`}>{r.reason}</span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.rejectRemark ?? '—'}
                      </td>
                      <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {fmtDT(r.lastUpdatedTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */
function StatCard({ label, sub, value, icon, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Ico name={icon} size={18} />
      </div>
      <div className="stat-body">
        <div className="stat-label">{label}</div>
        <div className="stat-value">
          {value != null
            ? fmt(value)
            : <div className="skel" style={{ height: 32, width: 70, borderRadius: 6 }} />}
        </div>
        <div className="stat-sub">{sub}</div>
      </div>
    </div>
  )
}

function EngineCard({ icon, label, children }) {
  return (
    <div className="engine-card">
      <div className="engine-icon">
        <Ico name={icon} size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="engine-label">{label}</div>
        {children}
      </div>
    </div>
  )
}

function ProgressRow({ label, pct, color }) {
  return (
    <div className="sys-row">
      <div className="sys-lbl">{label}</div>
      <div className="prog-wrap">
        <div className="prog-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
