import axios from 'axios'
import { buildFilterParams } from '../utils/format'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
})

export async function fetchMigrationFlags(filters) {
  const { data } = await api.get('/api/dashboard/migration-flags', {
    params: buildFilterParams(filters),
  })
  return data
}

export async function fetchRequestSummary(filters) {
  const { data } = await api.get('/api/dashboard/request-summary', {
    params: buildFilterParams(filters),
  })
  return data
}

export async function fetchFailedRequests(filters) {
  const { data } = await api.get('/api/dashboard/failed-requests', {
    params: buildFilterParams(filters),
  })
  return data
}

export async function fetchEngineStatus() {
  const { data } = await api.get('/api/dashboard/engine-status')
  return data
}

export async function fetchProductTypes() {
  const { data } = await api.get('/api/dashboard/product-types')
  return data
}
