import {
  Box,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined'
import MetricCard, { SectionCard } from '../common/MetricCard'
import { formatDateTime, formatNumber, formatSeconds } from '../../utils/format'

function EngineCard({ engine, loading }) {
  const isRunning = engine?.status === 'RUNNING'

  if (loading) {
    return <Skeleton variant="rounded" height={280} />
  }

  if (!engine) return null

  const metrics = [
    { label: 'Last Execution', value: formatDateTime(engine.lastExecution) },
    { label: 'Next Scheduled Run', value: formatDateTime(engine.nextExecution) },
    { label: 'Cards / Run', value: formatNumber(engine.cardsProcessedPerRun) },
    { label: 'Avg Processing Time', value: formatSeconds(engine.avgProcessingTime) },
    { label: 'Parallel Threads', value: formatNumber(engine.threads) },
    { label: 'Batch Size', value: formatNumber(engine.batchSize) },
    { label: 'Period', value: engine.period || '—' },
  ]

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(160deg, rgba(56,189,248,0.06) 0%, rgba(17,26,46,1) 55%)'
            : 'linear-gradient(160deg, rgba(15,76,129,0.05) 0%, #ffffff 55%)',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Engine Instance
          </Typography>
          <Typography variant="h6">{engine.engineId}</Typography>
        </Box>
        <Chip
          icon={isRunning ? <PlayCircleOutlineIcon /> : <StopCircleOutlinedIcon />}
          label={isRunning ? 'Running' : 'Stopped'}
          color={isRunning ? 'success' : 'error'}
          variant="filled"
          sx={{ fontWeight: 600 }}
        />
      </Stack>

      <Grid container spacing={2}>
        {metrics.map((metric) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              {metric.label}
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {metric.value}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default function EngineMonitoring({ engines, loading, error }) {
  return (
    <SectionCard
      title="Migration Service Engine"
      subtitle="Live engine telemetry from MD_ENGINE_CONFIGURATIONS"
    >
      {error ? (
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'warning.main',
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Engine status is currently unavailable. Ensure the backend is running and engine
            telemetry data is accessible.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {error}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {loading
            ? [1, 2].map((i) => (
                <Grid key={i} size={{ xs: 12, md: 6 }}>
                  <Skeleton variant="rounded" height={280} />
                </Grid>
              ))
            : engines?.length
              ? engines.map((engine) => (
                  <Grid key={engine.engineId} size={{ xs: 12, md: engines.length > 1 ? 6 : 12 }}>
                    <EngineCard engine={engine} loading={false} />
                  </Grid>
                ))
              : (
                <Grid size={{ xs: 12 }}>
                  <MetricCard
                    title="No Engine Data"
                    subtitle="No rows found in MD_ENGINE_CONFIGURATIONS"
                    value={0}
                    color="#64748b"
                    loading={false}
                  />
                </Grid>
              )}
        </Grid>
      )}
    </SectionCard>
  )
}
