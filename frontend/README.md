# Professional Banking Dashboard

A modern, responsive banking dashboard built with Next.js, Tailwind CSS, and Recharts. Features a clean, professional design with light and dark mode support, real-time financial analytics, and an intuitive user interface.

## Features

✨ **Dashboard Sections**
- **Account Overview** - Display multiple accounts with balances, performance metrics, and quick summary stats
- **Your Cards** - Beautiful card interface showing Visa and Mastercard details with available balance and status
- **Financial Analytics** - Interactive charts including:
  - Income vs Spending line chart
  - Spending by Category pie chart
  - Monthly Breakdown bar chart
- **Recent Transactions** - Complete transaction history with:
  - Search functionality
  - Category badges
  - Status indicators
  - Pagination controls

🎨 **Design Features**
- Modern, professional banking aesthetic
- Light and dark mode toggle
- Responsive grid layout (mobile, tablet, desktop)
- Smooth transitions and hover effects
- Clean typography and spacing
- Color-coded transactions (income, spending, transfers)

📊 **Interactive Elements**
- Theme toggle button (floating action button)
- Card visibility toggle for sensitive data
- Transaction search bar
- Pagination controls
- Interactive charts with tooltips and legends
- Responsive navigation header

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 with semantic design tokens
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Language**: TypeScript
- **Package Manager**: pnpm

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
components/
├── dashboard.tsx           # Main dashboard component with theme toggle
├── header.tsx             # Top navigation bar
├── account-overview.tsx   # Account cards and summary stats
├── cards.tsx              # Credit/debit card display
├── analytics.tsx          # Financial charts
└── recent-transactions.tsx # Transaction table with search

app/
├── page.tsx               # Main page entry
└── globals.css            # Global styles and design tokens
```

## Design System

### Color Palette
- **Primary**: Blue (`oklch(0.5 0.175 263)`)
- **Success**: Green (`oklch(0.65 0.15 142)`)
- **Warning**: Amber (`oklch(0.7 0.19 56)`)
- **Danger**: Red (`oklch(0.58 0.22 22)`)
- **Accent**: Purple (`oklch(0.55 0.15 305)`)

### Typography
- **Headings**: Sans-serif (Geist)
- **Body**: Sans-serif (Geist)
- **Mono**: Monospace (Geist Mono) - used for card numbers

### Spacing Scale
Uses Tailwind's default spacing scale with semantic CSS variables for consistency across themes.

## Components

### Dashboard
Main container that manages theme state and renders all sections. Features:
- Dark/Light mode toggle
- Responsive grid layout
- Smooth animations

### Header
Sticky navigation bar with:
- Brand logo and name
- User greeting and status
- Notification and settings icons
- User avatar

### Account Overview
Three-column account summary showing:
- Account type and name
- Current balance
- Month-over-month performance
- Summary cards with key metrics

### Cards
Beautiful card interface displaying:
- Card type (Visa/Mastercard)
- Last 4 digits (masked for security)
- Cardholder name and expiry
- Available balance
- Card status badge
- Card visibility toggle

### Analytics
Interactive financial charts:
- **Line Chart**: Income vs Spending trends over 6 months
- **Pie Chart**: Spending breakdown by category
- **Bar Chart**: Monthly comparison of income and spending

### Recent Transactions
Transaction history table with:
- Search/filter functionality
- Category badges
- Color-coded amounts
- Status indicators
- Pagination controls

## Customization

### Theme Colors
Edit the design tokens in `app/globals.css` to customize colors:

```css
:root {
  --primary: oklch(0.5 0.175 263); /* Blue */
  --chart-1: oklch(0.5 0.175 263); /* Chart color 1 */
  /* ... more tokens */
}
```

### Sample Data
All data is currently hardcoded in components for demo purposes. To connect real APIs:

1. Create API endpoints
2. Use SWR or React Query for data fetching
3. Replace hardcoded data with API calls
4. Add loading states and error handling

### Responsive Breakpoints
The dashboard uses Tailwind's breakpoints:
- `sm`: 640px - tablets
- `md`: 768px - larger tablets
- `lg`: 1024px - desktops

## Performance

- Optimized images and icons
- Lazy-loaded charts with Recharts
- Semantic CSS tokens for smaller CSS payloads
- Next.js App Router optimization
- Responsive images using native browser features

## Accessibility

- Semantic HTML structure
- ARIA labels on buttons
- Keyboard navigation support
- Color contrast meets WCAG standards
- Screen reader friendly text
- Form labels properly associated

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Future Enhancements

- Real API integration with backend
- User authentication
- Transaction filtering and sorting
- Export to PDF/CSV
- Mobile app version
- Budget tracking and alerts
- Bill payment integration
- Investment portfolio tracking
- Real-time notifications
- Advanced analytics and insights
