import dayjs from 'dayjs'

export function formatNumber(value) {
  if (value == null || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat().format(value)
}

export function formatDateTime(value) {
  if (!value) return '—'
  return dayjs(value).format('DD MMM YYYY, HH:mm:ss')
}

export function formatSeconds(value) {
  if (value == null || Number.isNaN(value)) return '—'
  return `${Number(value).toFixed(2)} sec/card`
}

export function buildFilterParams(filters) {
  const params = {}

  if (filters.fromDate) {
    params.fromDate = dayjs(filters.fromDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss')
  }
  if (filters.toDate) {
    params.toDate = dayjs(filters.toDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss')
  }
  if (filters.productType) params.productType = filters.productType
  if (filters.reason) params.reason = filters.reason
  if (filters.mgrFlag && filters.mgrFlag !== 'all') {
    params.mgrFlag = Number(filters.mgrFlag)
  }

  return params
}
