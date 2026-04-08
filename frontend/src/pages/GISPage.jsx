import { useState, useEffect } from 'react'

export default function GISPage() {
  const [concessions, setConcessions] = useState([])
  const [filteredConcessions, setFilteredConcessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedConcession, setSelectedConcession] = useState(null)
  const [activeTab, setActiveTab] = useState('concessions')
  const [viewMode, setViewMode] = useState('list')

  const [formData, setFormData] = useState({
    name: '',
    iupNumber: '',
    coordinates: '',
    area: '',
    status: 'active',
    expiryDate: '',
    licensee: '',
    description: '',
  })

  const statuses = ['active', 'pending', 'expired', 'suspended']

  useEffect(() => {
    setTimeout(() => {
      const concessionsData = [
        {
          id: 1,
          name: 'Mining Block Alpha',
          iupNumber: 'IUP/OP/2018-001',
          coordinates: { lat: -6.2088, lng: 106.8456, area: 2500 },
          area: 2500,
          status: 'active',
          licensee: 'PT. Anda Selalu Untung',
          licenseDate: '2018-06-15',
          expiryDate: '2028-12-31',
          documents: [
            { id: 1, name: 'IUP Certificate', date: '2023-06-15', type: 'pdf' },
            { id: 2, name: 'Environmental Impact Assessment', date: '2023-05-01', type: 'pdf' },
            { id: 3, name: 'Coordinates & Boundaries', date: '2023-06-01', type: 'gis' },
          ],
          zones: [
            { name: 'Mining Zone A', area: 2500, type: 'primary' },
            { name: 'Tailings Storage Facility', area: 1200, type: 'waste' },
            { name: 'Environmental Buffer', area: 1300, type: 'buffer' },
          ],
          drilling_locations: [
            { id: 'DL-001', coordinates: { lat: -6.2100, lng: 106.8450 }, depth: 450, status: 'active' },
            { id: 'DL-002', coordinates: { lat: -6.2080, lng: 106.8460 }, depth: 380, status: 'completed' },
            { id: 'DL-003', coordinates: { lat: -6.2075, lng: 106.8470 }, depth: 520, status: 'planned' },
          ],
          compliance: {
            environmental: { status: 'compliant', lastAudit: '2026-03-10', nextAudit: '2026-09-10' },
            social: { status: 'compliant', lastAudit: '2026-02-15', nextAudit: '2026-08-15' },
            safety: { status: 'compliant', lastAudit: '2026-04-01', nextAudit: '2026-10-01' },
          },
          assets: [
            { id: 'EXC-001', type: 'Excavator', count: 3, status: 'operational' },
            { id: 'DRL-001', type: 'Drill Rig', count: 2, status: 'operational' },
            { id: 'TRK-001', type: 'Haul Truck', count: 5, status: 'operational' },
          ],
          production: { monthlyTarget: 50000, monthlyActual: 48500, ytdProduction: 220000, unit: 'tonnes' },
          description: 'Primary mining concession in East Kalimantan with active extraction operations and environmental compliance',
        },
        {
          id: 2,
          name: 'Mining Block Beta',
          iupNumber: 'IUP/OP/2019-002',
          coordinates: { lat: -6.3200, lng: 106.9100, area: 3500 },
          area: 3500,
          status: 'active',
          licensee: 'PT. Anda Selalu Untung',
          licenseDate: '2019-03-01',
          expiryDate: '2029-06-30',
          documents: [
            { id: 1, name: 'IUP Certificate', date: '2024-03-01', type: 'pdf' },
            { id: 2, name: 'Coordinates & Boundaries', date: '2024-02-15', type: 'gis' },
          ],
          zones: [
            { name: 'Mining Zone B', area: 2000, type: 'primary' },
            { name: 'Tailings Storage Facility', area: 900, type: 'waste' },
            { name: 'Environmental Buffer', area: 600, type: 'buffer' },
          ],
          drilling_locations: [
            { id: 'DL-004', coordinates: { lat: -6.2210, lng: 106.8590 }, depth: 400, status: 'active' },
            { id: 'DL-005', coordinates: { lat: -6.2190, lng: 106.8610 }, depth: 420, status: 'active' },
          ],
          compliance: {
            environmental: { status: 'compliant', lastAudit: '2026-02-20', nextAudit: '2026-08-20' },
            social: { status: 'compliant', lastAudit: '2026-01-30', nextAudit: '2026-07-30' },
            safety: { status: 'compliant', lastAudit: '2026-03-15', nextAudit: '2026-09-15' },
          },
          assets: [
            { id: 'EXC-002', type: 'Excavator', count: 2, status: 'operational' },
            { id: 'TRK-002', type: 'Haul Truck', count: 4, status: 'operational' },
          ],
          production: { monthlyTarget: 35000, monthlyActual: 34200, ytdProduction: 150000, unit: 'tonnes' },
          description: 'Secondary mining concession in Central Kalimantan with steady-state operations',
        },
        {
          id: 3,
          name: 'Concession Area Gamma',
          iupNumber: 'IUP/2024/003',
          coordinates: { lat: -6.2300, lng: 106.8700, area: 2500 },
          area: 2500,
          status: 'pending',
          licensee: 'PT. Anda Selalu Untung',
          licenseDate: '2024-09-01',
          expiryDate: '2029-08-31',
          documents: [
            { id: 1, name: 'IUP Application', date: '2024-08-01', type: 'pdf' },
            { id: 2, name: 'Survey Report', date: '2024-08-15', type: 'pdf' },
          ],
          zones: [
            { name: 'Exploration Zone', area: 2500, type: 'exploration' },
          ],
          drilling_locations: [
            { id: 'DL-006', coordinates: { lat: -6.2310, lng: 106.8690 }, depth: 300, status: 'planned' },
            { id: 'DL-007', coordinates: { lat: -6.2290, lng: 106.8710 }, depth: 350, status: 'planned' },
          ],
          compliance: {
            environmental: { status: 'pending', lastAudit: 'N/A', nextAudit: '2026-06-01' },
            social: { status: 'pending', lastAudit: 'N/A', nextAudit: '2026-05-15' },
            safety: { status: 'pending', lastAudit: 'N/A', nextAudit: '2026-08-01' },
          },
          assets: [],
          production: { monthlyTarget: 0, monthlyActual: 0, ytdProduction: 0, unit: 'tonnes' },
          description: 'Exploration stage concession awaiting operationalization in North Sumatra',
        },
        {
          id: 4,
          name: 'Exploration Area Delta',
          iupNumber: 'IPPKH/2023/004',
          coordinates: { lat: -6.2150, lng: 106.8350, area: 4000 },
          area: 4000,
          status: 'active',
          licensee: 'PT. Anda Selalu Untung',
          licenseDate: '2023-12-01',
          expiryDate: '2027-11-30',
          documents: [
            { id: 1, name: 'IPPKH License', date: '2023-12-01', type: 'pdf' },
            { id: 2, name: 'Exploration Plan', date: '2023-11-15', type: 'pdf' },
          ],
          zones: [
            { name: 'Active Exploration Zone', area: 3000, type: 'exploration' },
            { name: 'Survey Buffer', area: 1000, type: 'buffer' },
          ],
          drilling_locations: [
            { id: 'DL-008', coordinates: { lat: -6.2160, lng: 106.8340 }, depth: 250, status: 'completed' },
            { id: 'DL-009', coordinates: { lat: -6.2140, lng: 106.8360 }, depth: 280, status: 'active' },
          ],
          compliance: {
            environmental: { status: 'compliant', lastAudit: '2026-03-05', nextAudit: '2026-09-05' },
            social: { status: 'compliant', lastAudit: '2026-02-10', nextAudit: '2026-08-10' },
            safety: { status: 'compliant', lastAudit: '2026-03-20', nextAudit: '2026-09-20' },
          },
          assets: [
            { id: 'DRL-002', type: 'Drill Rig', count: 1, status: 'operational' },
          ],
          production: { monthlyTarget: 0, monthlyActual: 0, ytdProduction: 0, unit: 'samples' },
          description: 'Active exploration concession in South Sumatra conducting resource delineation',
        },
      ]
      setConcessions(concessionsData)
      setFilteredConcessions(concessionsData)
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    let filtered = concessions

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.iupNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.licensee.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus)
    }

    setFilteredConcessions(filtered)
  }, [searchTerm, filterStatus, concessions])

  const handleAddConcession = (e) => {
    e.preventDefault()
    const newConcession = {
      id: concessions.length + 1,
      ...formData,
      documents: [],
      zones: [],
      drilling_locations: [],
      compliance: {
        environmental: { status: 'pending', lastAudit: 'N/A', nextAudit: '' },
        social: { status: 'pending', lastAudit: 'N/A', nextAudit: '' },
        safety: { status: 'pending', lastAudit: 'N/A', nextAudit: '' },
      },
      assets: [],
      production: { monthlyTarget: 0, monthlyActual: 0, ytdProduction: 0, unit: 'tonnes' },
      description: formData.description,
    }
    setConcessions([...concessions, newConcession])
    setFormData({
      name: '',
      iupNumber: '',
      coordinates: '',
      area: '',
      status: 'active',
      expiryDate: '',
      licensee: '',
      description: '',
    })
    setShowAddForm(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'suspended':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    const icons = { active: '✅', pending: '⏳', expired: '❌', suspended: '⛔' }
    return icons[status] || '❓'
  }

  const getComplianceColor = (status) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-50 border-green-300 text-green-900'
      case 'pending':
        return 'bg-yellow-50 border-yellow-300 text-yellow-900'
      case 'non-compliant':
        return 'bg-red-50 border-red-300 text-red-900'
      default:
        return 'bg-gray-50 border-gray-300 text-gray-900'
    }
  }

  const stats = {
    total: concessions.length,
    active: concessions.filter(c => c.status === 'active').length,
    pending: concessions.filter(c => c.status === 'pending').length,
    expired: concessions.filter(c => c.status === 'expired').length,
    totalArea: concessions.reduce((sum, c) => sum + c.area, 0),
    totalProduction: concessions.reduce((sum, c) => sum + c.production.ytdProduction, 0),
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading GIS data...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">🗺️ GIS & Land Management</h1>
          <p className="text-gray-600 mt-2">Visualize and manage mining concessions, licenses, and environmental zones</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          + Add Concession
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Concessions</h3>
          <p className="text-4xl font-bold text-primary-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Active</h3>
          <p className="text-4xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Area</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalArea.toLocaleString()}</p>
          <p className="text-xs text-gray-600">hectares</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">YTD Production</h3>
          <p className="text-3xl font-bold text-orange-600">{(stats.totalProduction / 1000).toFixed(1)}k</p>
          <p className="text-xs text-gray-600">tonnes</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-lg shadow p-2">
        <button
          onClick={() => setActiveTab('concessions')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'concessions'
              ? 'bg-primary-600 text-white'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          📍 Concessions
        </button>
        <button
          onClick={() => setActiveTab('zones')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'zones'
              ? 'bg-primary-600 text-white'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          🔲 Zones & Areas
        </button>
        <button
          onClick={() => setActiveTab('drilling')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'drilling'
              ? 'bg-primary-600 text-white'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          🚀 Drilling Locations
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'compliance'
              ? 'bg-primary-600 text-white'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          ✅ Compliance
        </button>
        <button
          onClick={() => setActiveTab('production')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'production'
              ? 'bg-primary-600 text-white'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          📊 Production
        </button>
      </div>

      {/* Upload Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Register New Concession</h2>
          <form onSubmit={handleAddConcession} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Concession Name *</label>
              <input
                type="text"
                required
                placeholder="e.g., Mining Block Alpha"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">IUP/License Number *</label>
              <input
                type="text"
                required
                placeholder="e.g., IUP/2024/001"
                value={formData.iupNumber}
                onChange={(e) => setFormData({ ...formData, iupNumber: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Area (hectares) *</label>
              <input
                type="number"
                required
                placeholder="e.g., 5000"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {statuses.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Expiry Date *</label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Licensee *</label>
              <input
                type="text"
                required
                value={formData.licensee}
                onChange={(e) => setFormData({ ...formData, licensee: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                placeholder="Concession description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Register Concession
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Concessions</label>
            <input
              type="text"
              placeholder="Search by name, IUP number, licensee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status Filter</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CONCESSIONS TAB */}
      {activeTab === 'concessions' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Concession List</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                📋 List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                📊 Cards
              </button>
            </div>
          </div>
          {viewMode === 'list' ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Concession</th>
                  <th className="px-6 py-4 text-left font-semibold">IUP Number</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Area (ha)</th>
                  <th className="px-6 py-4 text-left font-semibold">Expiry Date</th>
                  <th className="px-6 py-4 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredConcessions.map(c => {
                  const daysUntilExpiry = Math.ceil((new Date(c.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
                  return (
                    <tr key={c.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{c.name}</td>
                      <td className="px-6 py-4 font-mono text-xs">{c.iupNumber}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>
                          {getStatusIcon(c.status)} {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{c.area.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">
                        {c.expiryDate}
                        <br />
                        <span className={daysUntilExpiry < 365 ? 'text-red-600 font-bold' : 'text-green-600'}>
                          {daysUntilExpiry} days
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedConcession(c)}
                          className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConcessions.map(c => {
                const daysUntilExpiry = Math.ceil((new Date(c.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={c.id} className="bg-white rounded-lg shadow border-l-4 border-primary-600 p-6 hover:shadow-lg transition">
                    <div className="mb-4">
                      <h3 className="font-bold text-lg mb-1">{c.name}</h3>
                      <p className="text-xs text-gray-600 font-mono">{c.iupNumber}</p>
                    </div>
                    <div className="space-y-2 text-sm mb-4 border-t pt-4">
                      <p><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded text-xs ${getStatusColor(c.status)}`}>{c.status}</span></p>
                      <p><span className="font-medium">Area:</span> {c.area.toLocaleString()} ha</p>
                      <p><span className="font-medium">Licensee:</span> {c.licensee}</p>
                      <p><span className="font-medium">Expires:</span> {c.expiryDate} ({daysUntilExpiry}d)</p>
                    </div>
                    <button
                      onClick={() => setSelectedConcession(c)}
                      className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ZONES & AREAS TAB */}
      {activeTab === 'zones' && (
        <div className="space-y-6">
          {filteredConcessions.map(c => (
            <div key={c.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">{c.name} - Environmental Zones</h3>
              {c.zones.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {c.zones.map((zone, idx) => {
                    const zoneTypeIcons = { primary: '⛏️', waste: '🚮', buffer: '🌿', exploration: '🔍' }
                    return (
                      <div key={idx} className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-300">
                        <p className="text-2xl mb-2">{zoneTypeIcons[zone.type] || '📍'}</p>
                        <h4 className="font-semibold text-blue-900">{zone.name}</h4>
                        <p className="text-sm text-blue-700 mt-2">{zone.area.toLocaleString()} hectares</p>
                        <p className="text-xs text-blue-600 mt-1 capitalize">{zone.type} zone</p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-600">No zones defined</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* DRILLING LOCATIONS TAB */}
      {activeTab === 'drilling' && (
        <div className="space-y-6">
          {filteredConcessions.map(c => (
            <div key={c.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">{c.name} - Drilling Locations</h3>
              {c.drilling_locations.length > 0 ? (
                <div className="space-y-3">
                  {c.drilling_locations.map((dl, idx) => {
                    const statusColors = { active: 'bg-green-100 text-green-800', completed: 'bg-blue-100 text-blue-800', planned: 'bg-yellow-100 text-yellow-800' }
                    return (
                      <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{dl.id}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[dl.status]}`}>{dl.status}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <p><span className="text-gray-600">Latitude:</span> <span className="font-mono">{dl.coordinates.lat}</span></p>
                          <p><span className="text-gray-600">Longitude:</span> <span className="font-mono">{dl.coordinates.lng}</span></p>
                          <p><span className="text-gray-600">Depth:</span> <span className="font-medium">{dl.depth}m</span></p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-600">No drilling locations recorded</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* COMPLIANCE TAB */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          {filteredConcessions.map(c => (
            <div key={c.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">{c.name} - Compliance Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Environmental', type: 'environmental' },
                  { name: 'Social', type: 'social' },
                  { name: 'Safety', type: 'safety' },
                ].map((comp, idx) => {
                  const compData = c.compliance[comp.type]
                  const statusIcons = { compliant: '✅', pending: '⏳', 'non-compliant': '❌' }
                  return (
                    <div key={idx} className={`p-4 rounded-lg border-l-4 border-primary-600 ${getComplianceColor(compData.status)}`}>
                      <h4 className="font-semibold mb-2">{comp.name}</h4>
                      <p className="text-sm mb-2">
                        {statusIcons[compData.status] || '❓'} {compData.status.charAt(0).toUpperCase() + compData.status.slice(1)}
                      </p>
                      <p className="text-xs mb-1"><span className="font-medium">Last Audit:</span> {compData.lastAudit}</p>
                      <p className="text-xs"><span className="font-medium">Next Audit:</span> {compData.nextAudit}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PRODUCTION TAB */}
      {activeTab === 'production' && (
        <div className="space-y-6">
          {filteredConcessions.map(c => (
            <div key={c.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">{c.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                  <p className="text-sm text-gray-600">Monthly Target</p>
                  <p className="text-2xl font-bold text-blue-700">{c.production.monthlyTarget.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 mt-1">{c.production.unit}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                  <p className="text-sm text-gray-600">Monthly Actual</p>
                  <p className="text-2xl font-bold text-green-700">{c.production.monthlyActual.toLocaleString()}</p>
                  <p className={`text-xs mt-1 ${c.production.monthlyActual >= c.production.monthlyTarget ? 'text-green-600' : 'text-red-600'}`}>
                    {c.production.monthlyTarget > 0 ? ((c.production.monthlyActual / c.production.monthlyTarget) * 100).toFixed(1) : '0'}% of target
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                  <p className="text-sm text-gray-600">YTD Production</p>
                  <p className="text-2xl font-bold text-purple-700">{(c.production.ytdProduction / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-purple-600 mt-1">{c.production.unit}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-600">
                  <p className="text-sm text-gray-600">Assets Operating</p>
                  <p className="text-2xl font-bold text-orange-700">{c.assets.reduce((sum, a) => sum + a.count, 0)}</p>
                  <p className="text-xs text-orange-600 mt-1">{c.assets.length} asset types</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Concession Details Modal */}
      {selectedConcession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto shadow-xl">
            <div className="p-6 border-b flex justify-between items-start sticky top-0 bg-white">
              <div>
                <h2 className="text-2xl font-bold">{selectedConcession.name}</h2>
                <p className="text-gray-600 text-sm mt-1">{selectedConcession.iupNumber}</p>
              </div>
              <button
                onClick={() => setSelectedConcession(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-bold text-lg mt-1 ${getStatusColor(selectedConcession.status).split(' ')[0]}`}>
                    {getStatusIcon(selectedConcession.status)} {selectedConcession.status}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Area</p>
                  <p className="font-bold text-lg text-blue-700">{selectedConcession.area.toLocaleString()} ha</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">License Period</p>
                  <p className="font-bold text-purple-700">{selectedConcession.licenseDate} - {selectedConcession.expiryDate}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Licensee</p>
                  <p className="font-bold text-orange-700">{selectedConcession.licensee}</p>
                </div>
              </div>

              {selectedConcession.description && (
                <div>
                  <h3 className="font-bold mb-2">Description</h3>
                  <p className="text-gray-700">{selectedConcession.description}</p>
                </div>
              )}

              {selectedConcession.documents.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3">Associated Documents</h3>
                  <div className="space-y-2">
                    {selectedConcession.documents.map((doc, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-600">{doc.date} • {doc.type.toUpperCase()}</p>
                        </div>
                        <button className="text-primary-600 hover:text-primary-800">⬇️</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedConcession(null)}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
