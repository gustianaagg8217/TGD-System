import api from './api'

export const assetService = {
  // List assets with filtering
  getAssets: (params) => api.get('/assets', { params }),

  // Search assets
  searchAssets: (query, params) => api.get('/assets/search', { params: { q: query, ...params } }),

  // Get single asset
  getAsset: (id) => api.get(`/assets/${id}`),

  // Get asset hierarchy
  getAssetHierarchy: (id) => api.get(`/assets/${id}/hierarchy`),

  // Create asset
  createAsset: (assetData) => api.post('/assets', assetData),

  // Update asset
  updateAsset: (id, assetData) => api.put(`/assets/${id}`, assetData),

  // Delete asset
  deleteAsset: (id, hardDelete = false) =>
    api.delete(`/assets/${id}`, { params: { hard_delete: hardDelete } }),

  // Dashboard overview
  getDashboardOverview: () => api.get('/dashboard/overview'),
}
