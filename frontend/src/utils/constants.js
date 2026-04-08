export const ASSET_TYPES = [
  { value: 'machinery', label: 'Machinery' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'facility', label: 'Facility' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'tool', label: 'Tool' },
  { value: 'other', label: 'Other' },
]

export const ASSET_STATUS = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'inactive', label: 'Inactive', color: 'gray' },
  { value: 'maintenance', label: 'Maintenance', color: 'yellow' },
  { value: 'retired', label: 'Retired', color: 'red' },
]

export const MAINTENANCE_TYPES = [
  { value: 'preventive', label: 'Preventive' },
  { value: 'corrective', label: 'Corrective' },
  { value: 'inspection', label: 'Inspection' },
]

export const MAINTENANCE_STATUS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const USER_ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'viewer', label: 'Viewer' },
]

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  ASSETS: {
    LIST: '/assets',
    CREATE: '/assets',
    GET: (id) => `/assets/${id}`,
    UPDATE: (id) => `/assets/${id}`,
    DELETE: (id) => `/assets/${id}`,
  },
}
