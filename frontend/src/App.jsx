import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import {
  getEngineHistory,
  getEngineStatus,
  getFailedRequests,
  getHealth,
  getMe,
  getMigrationFlags,
  getProductTypes,
  getRequestSummary,
  login,
  logout,
} from './api/dashboardApi'
import './App.css'

const REFRESH_OPTIONS = [
  { label: '15s', ms: 15000 },
  { label: '30s', ms: 30000 },
  { label: '1 min', ms: 60000 },
  { label: '5 min', ms: 300000 },
]

const FLAG_LABELS = [
  { key: 'flag0', label: 'Flag 0 — Normal' },
  { key: 'flag1', label: 'Flag 1 — Initiated' },
  { key: 'flag2', label: 'Flag 2 — Activated + Balance' },
  { key: 'flag3', label: 'Flag 3 — History Migration' },
  { key: 'flag4', label: 'Flag 4 — Failed/Rejected' },
]

function StatRow({ title, data }) {
  if (!data) return null
  return (
    <TableRow>
      <TableCell>{title}</TableCell>
      <TableCell align="right">{data.replacement ?? 0}</TableCell>
      <TableCell align="right">{data.productChange ?? 0}</TableCell>
      <TableCell align="right">{(data.replacement ?? 0) + (data.productChange ?? 0)}</TableCell>
    </TableRow>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: 'admin123' })
  const [loginError, setLoginError] = useState('')
  const [refreshMs, setRefreshMs] = useState(30000)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [errors, setErrors] = useState([])

  const [health, setHealth] = useState(null)
  const [flags, setFlags] = useState(null)
  const [summary, setSummary] = useState(null)
  const [failed, setFailed] = useState([])
  const [productTypes, setProductTypes] = useState([])
  const [engineStatus, setEngineStatus] = useState([])
  const [engineHistory, setEngineHistory] = useState(null)

  const [filters, setFilters] = useState({
    productType: '',
    reason: '',
    mgrFlag: '',
  })

  const isAdmin = user?.role === 'ROLE_ADMIN'

  const buildParams = useCallback(() => {
    const params = {}
    if (filters.productType) params.productType = filters.productType
    if (filters.reason) params.reason = filters.reason
    if (filters.mgrFlag !== '') params.mgrFlag = filters.mgrFlag
    return params
  }, [filters])

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    const nextErrors = []
    const params = buildParams()
    let currentUser = null

    try {
      const me = await getMe()
      currentUser = me.authenticated ? me : null
      setUser(currentUser)
    } catch {
      setUser(null)
    }

    try {
      setHealth(await getHealth())
    } catch (e) {
      nextErrors.push(`Health: ${e.response?.status === 401 ? 'endpoint needs backend restart' : e.message}`)
    }

    try {
      setFlags(await getMigrationFlags(params))
    } catch (e) {
      nextErrors.push(`Migration flags: ${e.message}`)
    }

    try {
      setSummary(await getRequestSummary(params))
    } catch (e) {
      nextErrors.push(`Request summary: ${e.message}`)
    }

    try {
      setFailed(await getFailedRequests(params))
    } catch (e) {
      nextErrors.push(`Failed requests: ${e.message}`)
    }

    try {
      setProductTypes(await getProductTypes())
    } catch (e) {
      nextErrors.push(`Product types: ${e.message}`)
    }

    if (currentUser?.role === 'ROLE_ADMIN') {
      try {
        setEngineStatus(await getEngineStatus())
      } catch (e) {
        if (e.response?.status !== 403) {
          nextErrors.push(`Engine status: ${e.message}`)
        }
      }
      try {
        setEngineHistory(await getEngineHistory({ page: 0, size: 10 }))
      } catch (e) {
        if (e.response?.status !== 403) {
          nextErrors.push(`Engine history: ${e.message}`)
        }
      }
    } else {
      setEngineStatus([])
      setEngineHistory(null)
    }

    setErrors(nextErrors)
    setLastUpdated(new Date())
    setLoading(false)
  }, [buildParams])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    const id = setInterval(loadDashboard, refreshMs)
    return () => clearInterval(id)
  }, [loadDashboard, refreshMs])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      const result = await login(loginForm.username, loginForm.password)
      setUser(result)
      await loadDashboard()
    } catch {
      setLoginError('Invalid username or password')
    }
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
    setEngineStatus([])
    setEngineHistory(null)
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Recarding Migration Dashboard
          </Typography>
          <FormControl size="small" sx={{ minWidth: 100, mr: 2, bgcolor: 'white', borderRadius: 1 }}>
            <InputLabel id="refresh-label">Refresh</InputLabel>
            <Select
              labelId="refresh-label"
              label="Refresh"
              value={refreshMs}
              onChange={(e) => setRefreshMs(e.target.value)}
            >
              {REFRESH_OPTIONS.map((o) => (
                <MenuItem key={o.ms} value={o.ms}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button color="inherit" onClick={loadDashboard} disabled={loading}>
            Refresh now
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField size="small" label="Username" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} />
              <TextField size="small" type="password" label="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
              <Button type="submit" variant="contained">Login</Button>
              {user && <Button variant="outlined" onClick={handleLogout}>Logout</Button>}
            </Box>
            <Box>
              {user ? (
                <Typography variant="body2">Logged in as <strong>{user.username}</strong> ({user.role})</Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">Not logged in — public metrics still load; login as admin for engine data</Typography>
              )}
              {lastUpdated && (
                <Typography variant="caption" display="block" color="text.secondary">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Typography>
              )}
            </Box>
          </Stack>
          {loginError && <Alert severity="error" sx={{ mt: 2 }}>{loginError}</Alert>}
        </Paper>

        {health && (
          <Alert severity={health.status === 'OK' ? 'success' : 'error'} sx={{ mb: 2 }}>
            Database: {health.database} {health.dbPing != null ? `(ping ${health.dbPing})` : ''} — {health.status}
          </Alert>
        )}

        {errors.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {errors.map((err) => <div key={err}>{err}</div>)}
          </Alert>
        )}

        {loading && !flags && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Product Type</InputLabel>
              <Select label="Product Type" value={filters.productType} onChange={(e) => setFilters({ ...filters, productType: e.target.value })}>
                <MenuItem value="">All</MenuItem>
                {productTypes.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Reason</InputLabel>
              <Select label="Reason" value={filters.reason} onChange={(e) => setFilters({ ...filters, reason: e.target.value })}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Product Change">Product Change</MenuItem>
                <MenuItem value="Card Replacement">Card Replacement</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>MGR Flag</InputLabel>
              <Select label="MGR Flag" value={filters.mgrFlag} onChange={(e) => setFilters({ ...filters, mgrFlag: e.target.value })}>
                <MenuItem value="">All</MenuItem>
                {[0, 1, 2, 3, 4].map((f) => <MenuItem key={f} value={f}>Flag {f}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={loadDashboard}>Apply filters</Button>
          </Stack>
        </Paper>

        <Typography variant="h6" gutterBottom>Migration Flag Overview</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {FLAG_LABELS.map(({ key, label }) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="h4">{flags ? flags[key] : '—'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h6" gutterBottom>Recarding Request Statistics</Typography>
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Bucket</TableCell>
                <TableCell align="right">Replacement</TableCell>
                <TableCell align="right">Product Change</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <StatRow title="Pending (Flag 2)" data={summary?.pending} />
              <StatRow title="Processed (Flag 3+4)" data={summary?.processed} />
              <StatRow title="Completed (Flag 3)" data={summary?.completed} />
              <StatRow title="Failed (Flag 4)" data={summary?.failed} />
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" gutterBottom>Failed Requests (Flag 4)</Typography>
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Request ID</TableCell>
                <TableCell>Card</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Reject Remark</TableCell>
                <TableCell>Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {failed.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">No failed requests</TableCell></TableRow>
              ) : failed.map((row) => (
                <TableRow key={row.requestId}>
                  <TableCell>{row.requestId}</TableCell>
                  <TableCell>{row.cardNumber}</TableCell>
                  <TableCell>{row.reason}</TableCell>
                  <TableCell>{row.rejectRemark || '—'}</TableCell>
                  <TableCell>{row.lastUpdatedTime || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {isAdmin && (
          <>
            <Typography variant="h6" gutterBottom>Migration Service Engine</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {engineStatus.length === 0 ? (
                <Grid item xs={12}><Alert severity="info">No engine configuration rows returned (table may be empty).</Alert></Grid>
              ) : engineStatus.map((eng) => (
                <Grid item xs={12} md={6} key={eng.engineId}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1">{eng.engineId} — {eng.status}</Typography>
                      <Typography variant="body2">Last run: {eng.lastExecution || '—'}</Typography>
                      <Typography variant="body2">Next run: {eng.nextExecution || '—'}</Typography>
                      <Typography variant="body2">Cards/run: {eng.cardsProcessedPerRun ?? '—'}</Typography>
                      <Typography variant="body2">Avg time/card: {eng.avgProcessingTime ?? '—'} sec</Typography>
                      <Typography variant="body2">Threads: {eng.threads ?? '—'} | Batch: {eng.batchSize ?? '—'}</Typography>
                      <Typography variant="body2">Period: {eng.period || '—'}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Typography variant="subtitle1" gutterBottom>Engine Execution History (latest 10)</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Run ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                    <TableCell align="right">Cards</TableCell>
                    <TableCell align="right">Duration (s)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!engineHistory?.content?.length ? (
                    <TableRow><TableCell colSpan={6} align="center">No execution history (MD_ENGINE_EXECUTION_LOG may not exist)</TableCell></TableRow>
                  ) : engineHistory.content.map((row) => (
                    <TableRow key={row.runId}>
                      <TableCell>{row.runId}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.startTime || '—'}</TableCell>
                      <TableCell>{row.endTime || '—'}</TableCell>
                      <TableCell align="right">{row.cardsProcessed ?? '—'}</TableCell>
                      <TableCell align="right">{row.durationSeconds ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Container>
    </Box>
  )
}

export default App
