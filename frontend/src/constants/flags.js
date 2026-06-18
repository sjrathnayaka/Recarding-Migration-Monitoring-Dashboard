export const FLAG_META = [
  { key: 'flag0', flag: 0, label: 'Flag 0', title: 'Normal', color: '#64748b' },
  { key: 'flag1', flag: 1, label: 'Flag 1', title: 'Initiated', color: '#f59e0b' },
  { key: 'flag2', flag: 2, label: 'Flag 2', title: 'Activated + Balance', color: '#f97316' },
  { key: 'flag3', flag: 3, label: 'Flag 3', title: 'History Migration', color: '#10b981' },
  { key: 'flag4', flag: 4, label: 'Flag 4', title: 'Failed / Rejected', color: '#ef4444' },
]

export const REFRESH_OPTIONS = [
  { label: '15 seconds', value: 15000 },
  { label: '30 seconds', value: 30000 },
  { label: '1 minute', value: 60000 },
  { label: '5 minutes', value: 300000 },
]

export const REASON_OPTIONS = [
  { label: 'All Reasons', value: '' },
  { label: 'Product Change', value: 'Product Change' },
  { label: 'Card Replacement', value: 'Card Replacement' },
]

export const MGR_FLAG_OPTIONS = [
  { label: 'All Flags', value: 'all' },
  { label: 'Flag 0 — Normal', value: '0' },
  { label: 'Flag 1 — Initiated', value: '1' },
  { label: 'Flag 2 — Activated', value: '2' },
  { label: 'Flag 3 — History', value: '3' },
  { label: 'Flag 4 — Failed', value: '4' },
]

export const REQUEST_BUCKETS = [
  { key: 'pending', label: 'Pending', subtitle: 'MGRFLAG = 2', color: '#f97316' },
  { key: 'processed', label: 'Processed', subtitle: 'MGRFLAG 3 + 4', color: '#3b82f6' },
  { key: 'completed', label: 'Completed', subtitle: 'MGRFLAG = 3', color: '#10b981' },
  { key: 'failed', label: 'Failed / Rejected', subtitle: 'MGRFLAG = 4', color: '#ef4444' },
]
