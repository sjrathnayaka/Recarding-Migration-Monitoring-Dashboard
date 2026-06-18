import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { formatNumber } from '../../utils/format'

export default function MetricCard({ title, subtitle, value, color, loading }) {
  const theme = useTheme()

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 16px 48px rgba(0,0,0,0.45)'
              : '0 14px 36px rgba(15, 23, 42, 0.1)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: color,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width="60%" height={48} />
          ) : (
            <Typography variant="h4" sx={{ color, fontWeight: 700 }}>
              {formatNumber(value)}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}

export function SectionCard({ title, subtitle, action, children, sx }) {
  return (
    <Card sx={{ height: '100%', ...sx }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography variant="h6">{title}</Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Stack>
        {children}
      </CardContent>
    </Card>
  )
}
