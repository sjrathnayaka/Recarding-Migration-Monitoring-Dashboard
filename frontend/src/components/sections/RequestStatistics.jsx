import { useMemo, useState } from 'react'
import {
  Box,
  Chip,
  Collapse,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ReactECharts from 'echarts-for-react'
import MetricCard, { SectionCard } from '../common/MetricCard'
import { REQUEST_BUCKETS } from '../../constants/flags'
import { formatDateTime, formatNumber } from '../../utils/format'

function ReasonSplit({ breakdown, color }) {
  const replacement = breakdown?.replacement ?? 0
  const productChange = breakdown?.productChange ?? 0
  const total = replacement + productChange

  return (
    <Stack spacing={1.5} sx={{ mt: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Card Replacement
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {formatNumber(replacement)}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Product Change
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {formatNumber(productChange)}
        </Typography>
      </Stack>
      <Box
        sx={{
          height: 6,
          borderRadius: 99,
          overflow: 'hidden',
          display: 'flex',
          bgcolor: 'action.hover',
        }}
      >
        {total > 0 && (
          <>
            <Box sx={{ width: `${(replacement / total) * 100}%`, bgcolor: color, opacity: 0.85 }} />
            <Box sx={{ width: `${(productChange / total) * 100}%`, bgcolor: color, opacity: 0.45 }} />
          </>
        )}
      </Box>
    </Stack>
  )
}

export default function RequestStatistics({ summary, failedRequests, loading }) {
  const theme = useTheme()
  const [showFailed, setShowFailed] = useState(false)
  const isDark = theme.palette.mode === 'dark'

  const chartOption = useMemo(() => {
    const categories = REQUEST_BUCKETS.map((b) => b.label)
    const replacementData = REQUEST_BUCKETS.map(
      (b) => summary?.[b.key]?.replacement ?? 0,
    )
    const productChangeData = REQUEST_BUCKETS.map(
      (b) => summary?.[b.key]?.productChange ?? 0,
    )

    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: {
        top: 0,
        textStyle: { color: theme.palette.text.secondary },
      },
      grid: { left: 48, right: 16, top: 40, bottom: 48 },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: theme.palette.text.secondary, interval: 0, rotate: 15 },
        axisLine: { lineStyle: { color: theme.palette.divider } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: theme.palette.text.secondary },
        splitLine: { lineStyle: { color: theme.palette.divider, type: 'dashed' } },
      },
      series: [
        {
          name: 'Card Replacement',
          type: 'bar',
          stack: 'total',
          emphasis: { focus: 'series' },
          itemStyle: { color: isDark ? '#38bdf8' : '#0f4c81', borderRadius: [0, 0, 0, 0] },
          data: replacementData,
        },
        {
          name: 'Product Change',
          type: 'bar',
          stack: 'total',
          emphasis: { focus: 'series' },
          itemStyle: { color: isDark ? '#2dd4bf' : '#0d9488', borderRadius: [6, 6, 0, 0] },
          data: productChangeData,
        },
      ],
    }
  }, [summary, theme, isDark])

  return (
    <SectionCard
      title="Recarding Request Statistics"
      subtitle="Pending, processed, completed, and failed requests split by reason"
    >
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {REQUEST_BUCKETS.map((bucket) => {
          const breakdown = summary?.[bucket.key]
          const total =
            (breakdown?.replacement ?? 0) + (breakdown?.productChange ?? 0)

          return (
            <Grid key={bucket.key} size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ height: '100%' }}>
                <MetricCard
                  title={bucket.label}
                  subtitle={bucket.subtitle}
                  value={total}
                  color={bucket.color}
                  loading={loading}
                />
                {!loading && (
                  <Box sx={{ mt: -0.5, px: 2, pb: 2 }}>
                    <ReasonSplit breakdown={breakdown} color={bucket.color} />
                  </Box>
                )}
              </Box>
            </Grid>
          )
        })}
      </Grid>

      {loading ? (
        <Skeleton variant="rounded" height={360} sx={{ mb: 3 }} />
      ) : (
        <Box sx={{ height: 360, mb: 3 }}>
          <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
        </Box>
      )}

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 2,
            py: 1.5,
            cursor: 'pointer',
            bgcolor: 'action.hover',
          }}
          onClick={() => setShowFailed((v) => !v)}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2">Failed Request Details</Typography>
            <Chip
              size="small"
              label={formatNumber(failedRequests?.length ?? 0)}
              color="error"
              variant="outlined"
            />
          </Stack>
          <IconButton
            size="small"
            sx={{
              transform: showFailed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Stack>

        <Collapse in={showFailed}>
          {loading ? (
            <Skeleton variant="rectangular" height={200} />
          ) : failedRequests?.length ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Request ID</TableCell>
                    <TableCell>Card Number</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Reject Remark</TableCell>
                    <TableCell>Last Updated</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {failedRequests.map((row) => (
                    <TableRow key={row.requestId} hover>
                      <TableCell>{row.requestId}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{row.cardNumber}</TableCell>
                      <TableCell>{row.reason}</TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>{row.rejectRemark || '—'}</TableCell>
                      <TableCell>{formatDateTime(row.lastUpdatedTime)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No failed requests match the current filters.
              </Typography>
            </Box>
          )}
        </Collapse>
      </Box>
    </SectionCard>
  )
}
