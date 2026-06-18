import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Box, Container, Snackbar, Stack } from '@mui/material'
import DashboardHeader from './components/layout/DashboardHeader'
import FilterBar from './components/layout/FilterBar'
import MigrationFlagsOverview from './components/sections/MigrationFlagsOverview'
import RequestStatistics from './components/sections/RequestStatistics'
import EngineMonitoring from './components/sections/EngineMonitoring'
import {
  fetchEngineStatus,
  fetchFailedRequests,
  fetchMigrationFlags,
  fetchProductTypes,
  fetchRequestSummary,
} from './api/dashboardApi'

const DEFAULT_FILTERS = {
  fromDate: null,
  toDate: null,
  productType: '',
  reason: '',
  mgrFlag: 'all',
}

export default function Dashboard({ darkMode, onToggleTheme }) {
  const [refreshInterval, setRefreshInterval] = useState(30000)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [productTypes, setProductTypes] = useState([])
  const [flags, setFlags] = useState(null)
  const [summary, setSummary] = useState(null)
  const [failedRequests, setFailedRequests] = useState([])
  const [engines, setEngines] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [engineError, setEngineError] = useState(null)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const filterKey = useMemo(() => JSON.stringify(filters), [filters])

  const loadDashboard = useCallback(
    async (isManual = false) => {
      if (isManual) setRefreshing(true)
      else setLoading(true)

      setError(null)

      try {
        const [flagsData, summaryData, failedData, engineData] = await Promise.all([
          fetchMigrationFlags(filters),
          fetchRequestSummary(filters),
          fetchFailedRequests(filters),
          fetchEngineStatus().catch((err) => {
            setEngineError(
              err?.response?.data?.error || err?.message || 'Engine status unavailable',
            )
            return []
          }),
        ])

        setFlags(flagsData)
        setSummary(summaryData)
        setFailedRequests(failedData)
        setEngines(engineData)
        if (engineData?.length) setEngineError(null)
        setLastUpdated(new Date())
      } catch (err) {
        setError(err?.response?.data?.error || err?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [filters],
  )

  useEffect(() => {
    fetchProductTypes()
      .then(setProductTypes)
      .catch(() => setProductTypes([]))
  }, [])

  useEffect(() => {
    loadDashboard()
    const timer = setInterval(() => loadDashboard(true), refreshInterval)
    return () => clearInterval(timer)
  }, [loadDashboard, refreshInterval, filterKey])

  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>
      <DashboardHeader
        darkMode={darkMode}
        onToggleTheme={onToggleTheme}
        refreshInterval={refreshInterval}
        onRefreshIntervalChange={setRefreshInterval}
        lastUpdated={lastUpdated}
        onManualRefresh={() => loadDashboard(true)}
        refreshing={refreshing}
      />

      <Container maxWidth="xl" sx={{ pt: 3 }}>
        <Stack spacing={3}>
          <FilterBar filters={filters} onChange={setFilters} productTypes={productTypes} />

          <MigrationFlagsOverview data={flags} loading={loading} />

          <RequestStatistics
            summary={summary}
            failedRequests={failedRequests}
            loading={loading}
          />

          <EngineMonitoring engines={engines} loading={loading} error={engineError} />
        </Stack>
      </Container>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  )
}
