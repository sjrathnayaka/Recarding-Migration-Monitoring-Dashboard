import { useState, useEffect, useCallback } from 'react'
import ReactECharts from 'echarts-for-react'
import axios from 'axios'
import dayjs from 'dayjs'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import './App.css'

/* ─────────────────────────────────────────
   Config
───────────────────────────────────────── */
const API          = '/api/dashboard'
const WS_ENDPOINT  = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws-dashboard'
const UPDATE_TOPIC = '/topic/dashboard-updates'

/* DFCC brand colors — red is primary on https://www.dfcc.lk/ */
const BRAND = {
  red:      '#ed1d24',
  redDark:  '#c9181e',
  black:    '#000000',
  charcoal: '#2d3e50',
  success:  '#198754',
  amber:    '#d97706',
  muted:    '#676767',
  border:   '#e0e0e0',
  surface:  '#f6f6f6',
}

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
  // const [failed,      setFailed]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [history,     setHistory]     = useState([])
  const [wsConnected, setWsConnected] = useState(false)

  /* ── Fetch all data ── */
  const fetchAll = useCallback(async () => {
    try {
      const [f, s, e] = await Promise.all([
        axios.get(`${API}/migration-flags`),
        axios.get(`${API}/request-summary`),
        axios.get(`${API}/engine-status`),
        // axios.get(`${API}/failed-requests`),
      ])

      setFlags(f.data)
      setSummary(s.data)
      setEngines(e.data || [])
      // setFailed(fr.data || [])
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

  /* ── Initial load on mount ── */
  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  /* ── STOMP over SockJS: refresh when backend broadcasts DATA_CHANGED ── */
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_ENDPOINT),
      reconnectDelay: 5000,
      onConnect: () => {
        setWsConnected(true)
        client.subscribe(UPDATE_TOPIC, () => {
          fetchAll()
        })
      },
      onDisconnect: () => setWsConnected(false),
    })

    client.activate()

    return () => {
      setWsConnected(false)
      client.deactivate()
    }
  }, [fetchAll])

  /* ── Derived values ── */
  const engine        = engines[0] ?? {}
  const totalPending  = (summary?.pending?.replacement   ?? 0) + (summary?.pending?.productChange   ?? 0)
  const totalProc     = (summary?.processed?.replacement ?? 0) + (summary?.processed?.productChange ?? 0)
  const totalComp     = (summary?.completed?.replacement ?? 0) + (summary?.completed?.productChange ?? 0)
  const totalFailed   = (summary?.failed?.replacement    ?? 0) + (summary?.failed?.productChange    ?? 0)

  /* ── ECharts option ── */
  const chartOpt = {
    backgroundColor: 'transparent',
    grid: { top: 16, right: 20, bottom: 36, left: 52, containLabel: false },
    tooltip: {
      trigger: 'axis',
      backgroundColor: BRAND.red,
      borderColor: BRAND.red,
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: params => {
        const t = params[0]?.axisValue ?? ''
        return params.map(p =>
          `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:5px"></span>${p.seriesName}: <b>${Number(p.value).toLocaleString()}</b>`
        ).join('<br/>') + `<br/><small style="color:#f7b8bb">${t}</small>`
      },
    },
    xAxis: {
      type: 'category',
      data: history.map(h => h.time),
      axisLine: { lineStyle: { color: BRAND.border } },
      axisTick: { show: false },
      axisLabel: { color: BRAND.muted, fontSize: 11 },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: BRAND.surface, type: 'dashed' } },
      axisLabel: { color: BRAND.muted, fontSize: 11 },
    },
    series: [
      {
        name: 'Cards Processed',
        type: 'line', smooth: true, symbol: 'none',
        data: history.map(h => h.cards),
        lineStyle: { color: BRAND.red, width: 2.5 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(237,29,36,.18)' },
              { offset: 1, color: 'rgba(237,29,36,0)' },
            ],
          },
        },
      },
      {
        name: 'Pending',
        type: 'line', smooth: true, symbol: 'none',
        data: history.map(h => h.pending),
        lineStyle: { color: BRAND.charcoal, width: 2.5 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(45,62,80,.12)' },
              { offset: 1, color: 'rgba(45,62,80,0)' },
            ],
          },
        },
      },
    ],
  }

  /* ── Card definitions ── */
  const flagCards = [
    { label: 'Normal (Flag 0)',                        value: flags?.flag0, icon: 'grid',     color: 'c-black' },
    { label: 'Initiated (Flag 1)',                     value: flags?.flag1, icon: 'activity', color: 'c-black' },
    { label: 'Activated + Balance Migration (Flag 2)', value: flags?.flag2, icon: 'zap',      color: 'c-amber' },
    { label: 'History Migration (Flag 3)',             value: flags?.flag3, icon: 'check',    color: 'c-green' },
    { label: 'Failed/Rejected (Flag 4)',               value: flags?.flag4, icon: 'x',        color: 'c-red'   },
  ]

  const reqCards = [
    { label: 'Pending Requests',   sub: 'Awaiting processing',    value: totalPending, icon: 'clock',    color: 'c-black' },
    { label: 'Processed Requests', sub: 'In progress or queued',  value: totalProc,    icon: 'zap',      color: 'c-red'   },
    { label: 'Completed Requests', sub: 'Successfully completed', value: totalComp,    icon: 'check',    color: 'c-green' },
    { label: 'Failed / Rejected',  sub: 'Failed or rejected',     value: totalFailed,  icon: 'x',        color: 'c-red'   },
  ]

  const header = (
    <>
      <div className="dash-nav">
        <div className="dashboard-wrapper">
          <header className="dash-header">
            <div className="dash-header-left">
              <img
                src="/dfcc-logo.png"
                alt="DFCC Bank — Keep Growing"
                className="dash-brand-logo"
              />
              <div className="dash-subtitle">Migration Service · Monitoring Dashboard</div>
            </div>
            <div className="dash-header-right">
              <div className="refresh-chip">
                <div className={`refresh-dot ${wsConnected ? 'refresh-dot-live' : ''}`} />
                {lastRefresh ? `Updated ${dayjs(lastRefresh).format('HH:mm:ss')}` : 'Loading…'}
                {wsConnected && <span className="refresh-live-label">Live</span>}
              </div>
              <button className="icon-btn" title="Refresh now" onClick={fetchAll}>
                <Ico name="refresh" size={16} />
              </button>
            </div>
          </header>
        </div>
      </div>
    </>
  )

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="app-shell">
      {header}
      <div className="dashboard-wrapper dashboard-body">
        <div className="skel" style={{ height: 88, borderRadius: 12, marginBottom: 20 }} />
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
    <div className="app-shell">
      {header}

      <div className="dashboard-wrapper dashboard-body">

      {/* Error banner */}
      {error && (
        <div className="err-banner">
          <Ico name="alert" size={16} />
          {error}
        </div>
      )}

      {/* ── Cards per Migration Flag ── */}
      <section className="section">
        <div className="section-title">DFCC Bank Cards per <em>Migration Flag</em></div>
        <div className="flag-grid">
          {flagCards.map(c => <StatCard key={c.label} {...c} />)}
        </div>
      </section>

      {/* ── Request Statistics ── */}
      <section className="section">
        <div className="section-title"><em>Request</em> Statistics</div>
        <div className="req-grid">
          {reqCards.map(c => <StatCard key={c.label} {...c} />)}
        </div>
      </section>

      {/* ── Performance Timeline ── */}
      <section className="section">
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">Performance <em>Metrics Timeline</em></div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-line" style={{ background: BRAND.red }} />
                Cards Processed
              </div>
              <div className="legend-item">
                <div className="legend-line" style={{ background: BRAND.charcoal }} />
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

      {/* ── Engine Performance ── */}
      <section className="section">
        <div className="section-title">Migration Service <em>Engine Performance</em></div>
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

      {/* ── Failed Requests Table (disabled) ── */}
      {/* {failed.length > 0 && (
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
      )} */}
      </div>
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
        {sub && <div className="stat-sub">{sub}</div>}
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
