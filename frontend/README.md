# Migration Monitoring Dashboard

A React dashboard for monitoring card migration service metrics, built with Vite, Tailwind CSS, and Recharts.

## Features

- **Migration Flags** — Cards grouped by migration flag status
- **Request Statistics** — Pending, processed, completed, and failed requests
- **Engine Performance** — Real-time metrics, timeline charts, and system status

## Tech Stack

- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── main.tsx              # App entry point
├── App.tsx               # Root component
├── index.css             # Global styles and design tokens
└── components/
    ├── dashboard.tsx     # Main dashboard layout
    ├── header.tsx        # Top navigation bar
    ├── migration-flags.tsx
    ├── request-statistics.tsx
    └── engine-performance.tsx
```

## Backend API Proxy

During development, Vite proxies `/api` requests to the Spring Boot backend at `http://localhost:8080`.

## License

MIT
