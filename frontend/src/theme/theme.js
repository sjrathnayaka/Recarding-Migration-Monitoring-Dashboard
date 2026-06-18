import { createTheme } from '@mui/material/styles'

const sharedTypography = {
  fontFamily: '"DM Sans", system-ui, sans-serif',
  h4: { fontWeight: 700, letterSpacing: '-0.02em' },
  h5: { fontWeight: 700, letterSpacing: '-0.01em' },
  h6: { fontWeight: 600 },
  subtitle2: { fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.7rem' },
}

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0f4c81', light: '#1a6bb5', dark: '#0a3559' },
    secondary: { main: '#0d9488' },
    background: {
      default: '#eef2f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    divider: 'rgba(15, 23, 42, 0.08)',
    success: { main: '#059669' },
    warning: { main: '#d97706' },
    error: { main: '#dc2626' },
    info: { main: '#0284c7' },
  },
  shape: { borderRadius: 14 },
  typography: sharedTypography,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(circle at 0% 0%, rgba(15, 76, 129, 0.06) 0%, transparent 45%), radial-gradient(circle at 100% 0%, rgba(13, 148, 136, 0.05) 0%, transparent 40%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(15, 23, 42, 0.06)',
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
        },
      },
    },
  },
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#38bdf8', light: '#7dd3fc', dark: '#0284c7' },
    secondary: { main: '#2dd4bf' },
    background: {
      default: '#0b1220',
      paper: '#111a2e',
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
    },
    divider: 'rgba(148, 163, 184, 0.12)',
    success: { main: '#34d399' },
    warning: { main: '#fbbf24' },
    error: { main: '#f87171' },
    info: { main: '#38bdf8' },
  },
  shape: { borderRadius: 14 },
  typography: sharedTypography,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(circle at 0% 0%, rgba(56, 189, 248, 0.08) 0%, transparent 45%), radial-gradient(circle at 100% 100%, rgba(45, 212, 191, 0.06) 0%, transparent 40%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
        },
      },
    },
  },
})
