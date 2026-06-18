import { useMemo, useState } from 'react'
import {
  Box,
  Grid,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material'
import PieChartOutlinedIcon from '@mui/icons-material/PieChartOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import ReactECharts from 'echarts-for-react'
import MetricCard, { SectionCard } from '../common/MetricCard'
import { FLAG_META } from '../../constants/flags'

export default function MigrationFlagsOverview({ data, loading }) {
  const theme = useTheme()
  const [chartView, setChartView] = useState('both')
  const isDark = theme.palette.mode === 'dark'

  const chartData = useMemo(() => {
    if (!data) return []
    return FLAG_META.map((flag) => ({
      name: `${flag.label} — ${flag.title}`,
      value: data[flag.key] ?? 0,
      itemStyle: { color: flag.color },
    }))
  }, [data])

  const pieOption = useMemo(
    () => ({
      tooltip: { trigger: 'item', formatter: '{b}<br/>{c} cards ({d}%)' },
      legend: {
        bottom: 0,
        textStyle: { color: theme.palette.text.secondary },
      },
      series: [
        {
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: isDark ? '#111a2e' : '#fff', borderWidth: 2 },
          label: { color: theme.palette.text.primary, formatter: '{b}\n{d}%' },
          data: chartData,
        },
      ],
    }),
    [chartData, theme, isDark],
  )

  const barOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis' },
      grid: { left: 48, right: 16, top: 24, bottom: 48 },
      xAxis: {
        type: 'category',
        data: FLAG_META.map((f) => f.label),
        axisLabel: { color: theme.palette.text.secondary },
        axisLine: { lineStyle: { color: theme.palette.divider } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: theme.palette.text.secondary },
        splitLine: { lineStyle: { color: theme.palette.divider, type: 'dashed' } },
      },
      series: [
        {
          type: 'bar',
          barWidth: '50%',
          data: FLAG_META.map((f) => ({
            value: data?.[f.key] ?? 0,
            itemStyle: { color: f.color, borderRadius: [6, 6, 0, 0] },
          })),
        },
      ],
    }),
    [data, theme],
  )

  const showPie = chartView === 'pie' || chartView === 'both'
  const showBar = chartView === 'bar' || chartView === 'both'

  return (
    <SectionCard
      title="Migration Flag Overview"
      subtitle="Live card counts by MGRFLAG from the CARD table"
      action={
        <ToggleButtonGroup
          size="small"
          exclusive
          value={chartView}
          onChange={(_, val) => val && setChartView(val)}
        >
          <ToggleButton value="pie">
            <PieChartOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} /> Pie
          </ToggleButton>
          <ToggleButton value="bar">
            <BarChartOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} /> Bar
          </ToggleButton>
          <ToggleButton value="both">Both</ToggleButton>
        </ToggleButtonGroup>
      }
    >
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {FLAG_META.map((flag) => (
          <Grid key={flag.key} size={{ xs: 6, sm: 4, md: 2.4 }}>
            <MetricCard
              title={flag.label}
              subtitle={flag.title}
              value={data?.[flag.key] ?? 0}
              color={flag.color}
              loading={loading}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {showPie && (
          <Grid size={{ xs: 12, md: showBar ? 6 : 12 }}>
            {loading ? (
              <Skeleton variant="rounded" height={340} />
            ) : (
              <Box sx={{ height: 340 }}>
                <ReactECharts option={pieOption} style={{ height: '100%', width: '100%' }} />
              </Box>
            )}
          </Grid>
        )}
        {showBar && (
          <Grid size={{ xs: 12, md: showPie ? 6 : 12 }}>
            {loading ? (
              <Skeleton variant="rounded" height={340} />
            ) : (
              <Box sx={{ height: 340 }}>
                <ReactECharts option={barOption} style={{ height: '100%', width: '100%' }} />
              </Box>
            )}
          </Grid>
        )}
      </Grid>
    </SectionCard>
  )
}
