import {
  AppBar,
  Box,
  Chip,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'
import { REFRESH_OPTIONS } from '../../constants/flags'
import { formatDateTime } from '../../utils/format'

export default function DashboardHeader({
  darkMode,
  onToggleTheme,
  refreshInterval,
  onRefreshIntervalChange,
  lastUpdated,
  onManualRefresh,
  refreshing,
}) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        zIndex: 1100,
        backdropFilter: 'blur(12px)',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(11, 18, 32, 0.85)'
            : 'rgba(255, 255, 255, 0.85)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ gap: 2, py: 1.5, flexWrap: 'wrap' }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)'
                  : 'linear-gradient(135deg, #0f4c81 0%, #0d9488 100%)',
              color: '#fff',
            }}
          >
            <CreditCardOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              Recarding Migration Monitor
            </Typography>
            <Typography variant="caption" color="text.secondary">
              SCB → DFCC card migration — live operational view
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
          {lastUpdated && (
            <Chip
              size="small"
              variant="outlined"
              label={`Updated ${formatDateTime(lastUpdated)}`}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            />
          )}

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select
              value={refreshInterval}
              onChange={(e) => onRefreshIntervalChange(e.target.value)}
              displayEmpty
              sx={{ fontSize: '0.875rem' }}
            >
              {REFRESH_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="Refresh now">
            <span>
              <IconButton onClick={onManualRefresh} disabled={refreshing} color="primary">
                <RefreshOutlinedIcon
                  sx={{
                    animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={onToggleTheme} color="primary">
              {darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
