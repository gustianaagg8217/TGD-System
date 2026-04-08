import { useState, useEffect } from 'react'

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [maintenanceLogs, setMaintenanceLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)

  const [formData, setFormData] = useState({
    asset: '',
    type: 'preventive',
    technician: '',
    cost: '',
    description: '',
  })

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      // Assets with lifecycle data
      const assetsData = [
        {
          id: 1,
          name: 'CNC Machining Center A',
          purchaseDate: '2022-01-15',
          purchasePrice: 500000,
          warrantyExpiry: '2025-01-15',
          amcExpiry: '2026-06-15',
          lifecycle: 'Active',
          depreciation: 75000,
          currentValue: 425000,
        },
        {
          id: 2,
          name: 'Hydraulic Press B',
          purchaseDate: '2020-06-20',
          purchasePrice: 250000,
          warrantyExpiry: '2022-06-20',
          amcExpiry: '2026-12-31',
          lifecycle: 'Mature',
          depreciation: 100000,
          currentValue: 150000,
        },
        {
          id: 3,
          name: 'Air Compressor System',
          purchaseDate: '2024-03-10',
          purchasePrice: 75000,
          warrantyExpiry: '2026-03-10',
          amcExpiry: '2027-03-10',
          lifecycle: 'New',
          depreciation: 5625,
          currentValue: 69375,
        },
      ]

      const maintenanceData = [
        {
          id: 1,
          asset: 'CNC Machining Center A',
          type: 'Preventive',
          date: '2026-04-05',
          technician: 'Technician 1',
          status: 'Completed',
          cost: 5000,
          downtime: 120,
          description: 'Regular maintenance',
          nextDate: '2026-07-05',
        },
        {
          id: 2,
          asset: 'Hydraulic Press B',
          type: 'Corrective',
          date: '2026-04-06',
          technician: 'Technician 2',
          status: 'Completed',
          cost: 7500,
          downtime: 240,
          description: 'Valve replacement',
          nextDate: '2026-10-06',
        },
        {
          id: 3,
          asset: 'Air Compressor System',
          type: 'Preventive',
          date: '2026-04-07',
          technician: 'Technician 1',
          status: 'Pending',
          cost: 3000,
          downtime: 60,
          description: 'Oil and filter change',
          nextDate: '2026-07-07',
        },
        {
          id: 4,
          asset: 'Forklift FL-001',
          type: 'Preventive',
          date: '2026-04-04',
          technician: 'Technician 3',
          status: 'Scheduled',
          cost: 2500,
          downtime: 90,
          description: 'Battery inspection',
          nextDate: '2026-06-04',
        },
      ]

      setAssets(assetsData)
      setMaintenanceLogs(maintenanceData)
      setFilteredLogs(maintenanceData)
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    let filtered = maintenanceLogs

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.technician.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(log => log.status.toLowerCase() === filterStatus.toLowerCase())
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.type.toLowerCase() === filterType.toLowerCase())
    }

    setFilteredLogs(filtered)
  }, [searchTerm, filterStatus, filterType, maintenanceLogs])

  const handleAddMaintenance = (e) => {
    e.preventDefault()
    const newLog = {
      id: maintenanceLogs.length + 1,
      asset: formData.asset,
      type: formData.type.charAt(0).toUpperCase() + formData.type.slice(1),
      date: new Date().toISOString().split('T')[0],
      technician: formData.technician,
      status: 'Scheduled',
      cost: parseInt(formData.cost),
      downtime: 0,
      description: formData.description,
      nextDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
    setMaintenanceLogs([...maintenanceLogs, newLog])
    setFormData({ asset: '', type: 'preventive', technician: '', cost: '', description: '' })
    setShowAddForm(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLifecycleColor = (lifecycle) => {
    switch (lifecycle) {
      case 'New':
        return 'bg-blue-100 text-blue-800'
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Mature':
        return 'bg-yellow-100 text-yellow-800'
      case 'End of Life':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const daysDiff = (date1, date2) => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    return Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24))
  }

  const stats = {
    total: maintenanceLogs.length,
    preventive: maintenanceLogs.filter(l => l.type === 'Preventive').length,
    corrective: maintenanceLogs.filter(l => l.type === 'Corrective').length,
    completed: maintenanceLogs.filter(l => l.status === 'Completed').length,
    pending: maintenanceLogs.filter(l => l.status === 'Pending').length,
    totalCost: maintenanceLogs.reduce((sum, l) => sum + l.cost, 0),
    totalDowntime: maintenanceLogs.reduce((sum, l) => sum + l.downtime, 0),
  }

  const warrantyStats = {
    active: assets.filter(a => new Date(a.warrantyExpiry) > new Date()).length,
    expired: assets.filter(a => new Date(a.warrantyExpiry) <= new Date()).length,
    daysToExpire: Math.min(...assets.map(a => daysDiff(a.warrantyExpiry, new Date()))),
  }

  const amcStats = {
    active: assets.filter(a => new Date(a.amcExpiry) > new Date()).length,
    expired: assets.filter(a => new Date(a.amcExpiry) <= new Date()).length,
  }

  if (loading) return <div className="text-center py-8">Loading maintenance data...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Maintenance & Lifecycle Management</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          + Log Maintenance
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-lg shadow p-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'overview'
              ? 'bg-primary-600 text-white'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('pm')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'pm'
              ? 'bg-primary-600 text-white'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          🔧 Preventive (PM)
        </button>
        <button
          onClick={() => setActiveTab('cm')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'cm'
              ? 'bg-primary-600 text-white'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          🚨 Corrective (CM)
        </button>
        <button
          onClick={() => setActiveTab('lifecycle')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'lifecycle'
              ? 'bg-primary-600 text-white'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          📈 Lifecycle & Depreciation
        </button>
        <button
          onClick={() => setActiveTab('warranty')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'warranty'
              ? 'bg-primary-600 text-white'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          📋 Warranty & AMC
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Maintenance</h3>
              <p className="text-4xl font-bold text-primary-600">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Preventive</h3>
              <p className="text-4xl font-bold text-blue-600">{stats.preventive}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Corrective</h3>
              <p className="text-4xl font-bold text-red-600">{stats.corrective}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Cost</h3>
              <p className="text-3xl font-bold text-green-600">${stats.totalCost.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Completed</h3>
              <p className="text-4xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Pending</h3>
              <p className="text-4xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Downtime</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.totalDowntime} hrs</p>
            </div>
          </div>
        </>
      )}

      {/* PREVENTIVE MAINTENANCE TAB */}
      {activeTab === 'pm' && (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Preventive Maintenance (PM) Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Scheduled PM</h3>
                <p className="text-4xl font-bold text-blue-600">{maintenanceLogs.filter(l => l.type === 'Preventive').length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">PM Cost</h3>
                <p className="text-3xl font-bold text-green-600">
                  ${maintenanceLogs.filter(l => l.type === 'Preventive').reduce((s, l) => s + l.cost, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* PM Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Asset</th>
                  <th className="px-6 py-4 text-left font-semibold">Last Date</th>
                  <th className="px-6 py-4 text-left font-semibold">Next Date</th>
                  <th className="px-6 py-4 text-left font-semibold">Days Remaining</th>
                  <th className="px-6 py-4 text-left font-semibold">Cost</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceLogs.filter(l => l.type === 'Preventive').map(log => (
                  <tr key={log.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{log.asset}</td>
                    <td className="px-6 py-4">{log.date}</td>
                    <td className="px-6 py-4">{log.nextDate}</td>
                    <td className="px-6 py-4 font-semibold">{Math.ceil((new Date(log.nextDate) - new Date()) / (1000 * 60 * 60 * 24))} days</td>
                    <td className="px-6 py-4">${log.cost.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* CORRECTIVE MAINTENANCE TAB */}
      {activeTab === 'cm' && (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Corrective Maintenance (CM) Logs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Total CM</h3>
                <p className="text-4xl font-bold text-red-600">{maintenanceLogs.filter(l => l.type === 'Corrective').length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">CM Cost</h3>
                <p className="text-3xl font-bold text-red-600">
                  ${maintenanceLogs.filter(l => l.type === 'Corrective').reduce((s, l) => s + l.cost, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">Downtime</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {maintenanceLogs.filter(l => l.type === 'Corrective').reduce((s, l) => s + l.downtime, 0)} hrs
                </p>
              </div>
            </div>
          </div>

          {/* CM Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Asset</th>
                  <th className="px-6 py-4 text-left font-semibold">Date</th>
                  <th className="px-6 py-4 text-left font-semibold">Description</th>
                  <th className="px-6 py-4 text-left font-semibold">Technician</th>
                  <th className="px-6 py-4 text-left font-semibold">Cost</th>
                  <th className="px-6 py-4 text-left font-semibold">Downtime</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceLogs.filter(l => l.type === 'Corrective').map(log => (
                  <tr key={log.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{log.asset}</td>
                    <td className="px-6 py-4">{log.date}</td>
                    <td className="px-6 py-4">{log.description}</td>
                    <td className="px-6 py-4">{log.technician}</td>
                    <td className="px-6 py-4 font-semibold">${log.cost.toLocaleString()}</td>
                    <td className="px-6 py-4">{log.downtime} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* LIFECYCLE & DEPRECIATION TAB */}
      {activeTab === 'lifecycle' && (
        <>
          <h2 className="text-2xl font-bold mb-6">Asset Depreciation & Lifecycle Tracker</h2>
          <div className="space-y-6">
            {assets.map(asset => (
              <div key={asset.id} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4">{asset.name}</h3>
                    <div className="space-y-3 text-sm">
                      <p><span className="font-semibold">Purchase Date:</span> {asset.purchaseDate}</p>
                      <p><span className="font-semibold">Purchase Price:</span> ${asset.purchasePrice.toLocaleString()}</p>
                      <p><span className="font-semibold">Age:</span> {Math.floor((new Date() - new Date(asset.purchaseDate)) / (365 * 24 * 60 * 60 * 1000))} years</p>
                      <p>
                        <span className="font-semibold">Lifecycle:</span>{' '}
                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getLifecycleColor(asset.lifecycle)}`}>
                          {asset.lifecycle}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-600 text-sm mb-1">Current Value</p>
                      <p className="text-3xl font-bold text-primary-600">${asset.currentValue.toLocaleString()}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-gray-600 text-sm mb-1">Total Depreciation</p>
                      <p className="text-2xl font-bold text-red-600">${asset.depreciation.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                {/* Depreciation Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold">Depreciation Progress</span>
                    <span>{Math.round((asset.depreciation / asset.purchasePrice) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${Math.min((asset.depreciation / asset.purchasePrice) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* WARRANTY & AMC TAB */}
      {activeTab === 'warranty' && (
        <>
          <h2 className="text-2xl font-bold mb-6">Warranty & AMC (Annual Maintenance Contract) Tracker</h2>
          
          {/* Warranty Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Active Warranties</h3>
              <p className="text-4xl font-bold text-green-600">{warrantyStats.active}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Expired Warranties</h3>
              <p className="text-4xl font-bold text-red-600">{warrantyStats.expired}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">AMC Active</h3>
              <p className="text-4xl font-bold text-blue-600">{amcStats.active}</p>
            </div>
          </div>

          {/* Warranty & AMC Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Asset</th>
                  <th className="px-6 py-4 text-left font-semibold">Warranty Expiry</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">AMC Expiry</th>
                  <th className="px-6 py-4 text-left font-semibold">AMC Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Days to Expiry</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => {
                  const warrantyDays = daysDiff(asset.warrantyExpiry, new Date())
                  const amcDays = daysDiff(asset.amcExpiry, new Date())
                  return (
                    <tr key={asset.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{asset.name}</td>
                      <td className="px-6 py-4">{asset.warrantyExpiry}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          warrantyDays > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {warrantyDays > 0 ? 'Active' : 'Expired'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{asset.amcExpiry}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          amcDays > 0 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {amcDays > 0 ? 'Active' : 'Expired'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">{Math.max(warrantyDays, amcDays)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add Maintenance Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">Log New Maintenance</h2>
          <form onSubmit={handleAddMaintenance} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Asset</label>
              <select
                required
                value={formData.asset}
                onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">Select asset...</option>
                {assets.map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Technician</label>
              <input
                type="text"
                required
                placeholder="Technician name..."
                value={formData.technician}
                onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cost</label>
              <input
                type="number"
                required
                placeholder="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                required
                placeholder="Maintenance description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 h-24"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Log Maintenance
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
    </div>
  )
}
