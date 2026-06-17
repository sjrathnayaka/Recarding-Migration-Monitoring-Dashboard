import axios from 'axios';

const BASE = '/api/dashboard';

const buildParams = (filters = {}) => {
  const p = {};
  if (filters.fromDate) p.fromDate = filters.fromDate;
  if (filters.toDate) p.toDate = filters.toDate;
  if (filters.productType) p.productType = filters.productType;
  if (filters.reason) p.reason = filters.reason;
  if (filters.mgrFlag !== undefined && filters.mgrFlag !== '') p.mgrFlag = filters.mgrFlag;
  return p;
};

export const fetchMigrationFlags = (filters) =>
  axios.get(`${BASE}/migration-flags`, { params: buildParams(filters) }).then(r => r.data);

export const fetchRequestSummary = (filters) =>
  axios.get(`${BASE}/request-summary`, { params: buildParams(filters) }).then(r => r.data);

export const fetchFailedRequests = (filters) =>
  axios.get(`${BASE}/failed-requests`, { params: buildParams(filters) }).then(r => r.data);

export const fetchEngineStatus = () =>
  axios.get(`${BASE}/engine-status`).then(r => r.data);

export const fetchEngineHistory = (page = 0, size = 10, fromDate, toDate, sortBy = 'startTime', sortDir = 'desc') =>
  axios.get(`${BASE}/engine-history`, {
    params: { page, size, fromDate, toDate, sortBy, sortDir },
  }).then(r => r.data);

export const fetchProductTypes = () =>
  axios.get(`${BASE}/product-types`).then(r => r.data);
