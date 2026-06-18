import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})

export async function login(username, password) {
  const body = new URLSearchParams({ username, password })
  const { data } = await api.post('/login', body)
  return data
}

export async function logout() {
  const { data } = await api.post('/logout')
  return data
}

export async function getMe() {
  const { data } = await api.get('/dashboard/me')
  return data
}

export async function getMigrationFlags(params = {}) {
  const { data } = await api.get('/dashboard/migration-flags', { params })
  return data
}

export async function getRequestSummary(params = {}) {
  const { data } = await api.get('/dashboard/request-summary', { params })
  return data
}

export async function getFailedRequests(params = {}) {
  const { data } = await api.get('/dashboard/failed-requests', { params })
  return data
}

export async function getEngineStatus() {
  const { data } = await api.get('/dashboard/engine-status')
  return data
}

export async function getEngineHistory(params = {}) {
  const { data } = await api.get('/dashboard/engine-history', { params })
  return data
}

export async function getProductTypes() {
  const { data } = await api.get('/dashboard/product-types')
  return data
}

export async function getHealth() {
  const { data } = await axios.get('/api/health')
  return data
}
