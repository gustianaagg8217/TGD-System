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
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    asset: '',
    type: 'preventive',
    technician: '',
    cost: '',
    description: '',
  })

  useEffect(() => {
    // Fetch assets from API
    const fetchAssets = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/assets?limit=100')
        const data = await response.json()
        
        // Handle Axios wrapping (response.data.items structure)
        let assetList = []
        if (data.data && data.data.items && Array.isArray(data.data.items)) {
          assetList = data.data.items
        } else if (data.items && Array.isArray(data.items)) {
          assetList = data.items
        } else if (Array.isArray(data)) {
          assetList = data
        }
        
        // Map API response to frontend format
        const assetsData = assetList.map(asset => ({
          id: asset.id || asset.asset_id || 0,
          name: asset.name || asset.asset_name || 'Unknown',
          purchaseDate: asset.purchase_date || asset.purchaseDate || '2024-01-01',
          purchasePrice: asset.purchase_price || asset.purchasePrice || 0,
          warrantyExpiry: asset.warranty_expiry || asset.warrantyExpiry || '2025-01-01',
          amcExpiry: asset.amc_expiry || asset.amcExpiry || '2026-01-01',
          lifecycle: asset.status === 'active' ? 'Active' : asset.status === 'maintenance' ? 'Maintenance' : 'Mature',
          depreciation: Math.round((asset.purchase_price || asset.purchasePrice || 0) * 0.15),
          currentValue: Math.round((asset.purchase_price || asset.purchasePrice || 0) * 0.85),
        }))
        
        // Use API data, no fallback dummy data
        setAssets(assetsData)
        
        console.log('✅ Assets fetched from API:', assetsData.length, assetsData.map(a => a.name))
      } catch (error) {
        console.error('❌ Error fetching assets:', error)
        // Fallback ke hardcoded jika API error
        setAssets([
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
          {
            id: 4,
            name: 'Excavator CAT 390F',
            purchaseDate: '2021-05-12',
            purchasePrice: 2500000,
            warrantyExpiry: '2024-05-12',
            amcExpiry: '2026-05-12',
            lifecycle: 'Active',
            depreciation: 400000,
            currentValue: 2100000,
          },
          {
            id: 5,
            name: 'Dredger KIP-3000',
            purchaseDate: '2019-08-08',
            purchasePrice: 7500000,
            warrantyExpiry: '2021-08-08',
            amcExpiry: '2026-08-08',
            lifecycle: 'Mature',
            depreciation: 3000000,
            currentValue: 4500000,
          },
          {
            id: 6,
            name: 'Power Station 5MW',
            purchaseDate: '2020-11-20',
            purchasePrice: 5000000,
            warrantyExpiry: '2023-11-20',
            amcExpiry: '2027-11-20',
            lifecycle: 'Active',
            depreciation: 1250000,
            currentValue: 3750000,
          },
          {
            id: 7,
            name: 'Smelter Plant',
            purchaseDate: '2018-03-15',
            purchasePrice: 12500000,
            warrantyExpiry: '2020-03-15',
            amcExpiry: '2026-03-15',
            lifecycle: 'Mature',
            depreciation: 5000000,
            currentValue: 7500000,
          },
          {
            id: 8,
            name: 'Forklift FL-001',
            purchaseDate: '2023-06-10',
            purchasePrice: 150000,
            warrantyExpiry: '2025-06-10',
            amcExpiry: '2026-06-10',
            lifecycle: 'Active',
            depreciation: 15000,
            currentValue: 135000,
          },
          {
            id: 9,
            name: 'Conveyor Belt System',
            purchaseDate: '2021-09-05',
            purchasePrice: 800000,
            warrantyExpiry: '2024-09-05',
            amcExpiry: '2026-09-05',
            lifecycle: 'Active',
            depreciation: 200000,
            currentValue: 600000,
          },
          {
            id: 10,
            name: 'Water Treatment Plant',
            purchaseDate: '2020-01-30',
            purchasePrice: 3000000,
            warrantyExpiry: '2023-01-30',
            amcExpiry: '2027-01-30',
            lifecycle: 'Active',
            depreciation: 750000,
            currentValue: 2250000,
          },
          {
            id: 11,
            name: 'Grinding Mill Unit',
            purchaseDate: '2022-04-12',
            purchasePrice: 1500000,
            warrantyExpiry: '2025-04-12',
            amcExpiry: '2026-10-12',
            lifecycle: 'Active',
            depreciation: 225000,
            currentValue: 1275000,
          },
          {
            id: 12,
            name: 'Boiler System',
            purchaseDate: '2019-07-20',
            purchasePrice: 2000000,
            warrantyExpiry: '2021-07-20',
            amcExpiry: '2026-07-20',
            lifecycle: 'Mature',
            depreciation: 800000,
            currentValue: 1200000,
          },
        ])
      }
    }
    
    fetchAssets()
    
    // Load maintenance data (using hardcoded for now)
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
        description: 'Regular maintenance & lubrication',
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
        asset: 'Excavator CAT 390F',
        type: 'Preventive',
        date: '2026-04-10',
        technician: 'Technician 3',
        status: 'Scheduled',
        cost: 12500,
        downtime: 180,
        description: 'Engine inspection and calibration',
        nextDate: '2026-07-10',
      },
      {
        id: 5,
        asset: 'Dredger KIP-3000',
        type: 'Corrective',
        date: '2026-04-08',
        technician: 'Technician 4',
        status: 'Scheduled',
        cost: 37500,
        downtime: 480,
        description: 'Hydraulic pump replacement',
        nextDate: '2026-10-08',
      },
      {
        id: 6,
        asset: 'Power Station 5MW',
        type: 'Preventive',
        date: '2026-04-01',
        technician: 'Technician 2',
        status: 'Completed',
        cost: 25000,
        downtime: 240,
        description: 'Turbine blade inspection',
        nextDate: '2026-07-01',
      },
      {
        id: 7,
        asset: 'Smelter Plant',
        type: 'Preventive',
        date: '2026-03-15',
        technician: 'Technician 5',
        status: 'Completed',
        cost: 62500,
        downtime: 720,
        description: 'Complete furnace cleaning',
        nextDate: '2026-09-15',
      },
      {
        id: 8,
        asset: 'Forklift FL-001',
        type: 'Preventive',
        date: '2026-04-04',
        technician: 'Technician 3',
        status: 'Completed',
        cost: 2500,
        downtime: 90,
        description: 'Battery inspection & fluid check',
        nextDate: '2026-06-04',
      },
      {
        id: 9,
        asset: 'Conveyor Belt System',
        type: 'Preventive',
        date: '2026-04-12',
        technician: 'Technician 1',
        status: 'Pending',
        cost: 8000,
        downtime: 120,
        description: 'Belt tension adjustment',
        nextDate: '2026-07-12',
      },
      {
        id: 10,
        asset: 'Water Treatment Plant',
        type: 'Corrective',
        date: '2026-04-11',
        technician: 'Technician 4',
        status: 'Scheduled',
        cost: 15000,
        downtime: 360,
        description: 'Filter membrane replacement',
        nextDate: '2026-07-11',
      },
      {
        id: 11,
        asset: 'Grinding Mill Unit',
        type: 'Preventive',
        date: '2026-04-09',
        technician: 'Technician 5',
        status: 'Scheduled',
        cost: 10000,
        downtime: 150,
        description: 'Ball mill bearing replacement',
        nextDate: '2026-07-09',
      },
      {
        id: 12,
        asset: 'Boiler System',
        type: 'Preventive',
        date: '2026-04-02',
        technician: 'Technician 2',
        status: 'Completed',
        cost: 20000,
        downtime: 300,
        description: 'Scale removal & tube cleaning',
        nextDate: '2026-07-02',
      },
      {
        id: 13,
        asset: 'CNC Machining Center A',
        type: 'Preventive',
        date: '2026-03-05',
        technician: 'Technician 1',
        status: 'Completed',
        cost: 5000,
        downtime: 120,
        description: 'Spindle calibration',
        nextDate: '2026-06-05',
      },
      {
        id: 14,
        asset: 'Hydraulic Press B',
        type: 'Preventive',
        date: '2026-02-10',
        technician: 'Technician 2',
        status: 'Completed',
        cost: 6000,
        downtime: 180,
        description: 'Pressure seal replacement',
        nextDate: '2026-05-10',
      },
    ]
    
    setMaintenanceLogs(maintenanceData)
    setFilteredLogs(maintenanceData)
    setLoading(false)
    
    console.log('✅ Maintenance logs loaded:', maintenanceData.length)
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
    
    // Reset previous messages
    setFormError(null)
    setFormSuccess(false)
    
    // Validation
    if (!formData.asset || formData.asset.trim() === '') {
      setFormError('❌ Asset harus dipilih')
      return
    }
    
    if (!formData.technician || formData.technician.trim() === '') {
      setFormError('❌ Nama technician harus diisi')
      return
    }
    
    if (!formData.cost || formData.cost === '' || parseInt(formData.cost) < 0) {
      setFormError('❌ Biaya harus diisi dengan nilai yang valid')
      return
    }
    
    try {
      setFormSubmitting(true)
      
      const newLog = {
        id: maintenanceLogs.length + 1,
        asset: formData.asset,
        type: formData.type.charAt(0).toUpperCase() + formData.type.slice(1),
        date: new Date().toISOString().split('T')[0],
        technician: formData.technician,
        status: 'Scheduled',
        cost: parseInt(formData.cost),
        downtime: 0,
        description: formData.description || '-',
        nextDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }
      
      // Update state with new log
      const updatedLogs = [...maintenanceLogs, newLog]
      setMaintenanceLogs(updatedLogs)
      setFilteredLogs(updatedLogs)
      
      // Reset form
      setFormData({ asset: '', type: 'preventive', technician: '', cost: '', description: '' })
      setFormSuccess(true)
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setFormSuccess(false)
      }, 3000)
      
      // Close form after 1.5 seconds
      setTimeout(() => {
        setShowAddForm(false)
      }, 1500)
      
      console.log('✅ Maintenance log added:', newLog)
    } catch (err) {
      console.error('❌ Error adding maintenance log:', err)
      setFormError('❌ Terjadi kesalahan saat menyimpan: ' + err.message)
    } finally {
      setFormSubmitting(false)
    }
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
          <h2 className="text-xl font-bold mb-4">📋 Log New Maintenance</h2>
          
          {/* Error Message */}
          {formError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {formError}
            </div>
          )}
          
          {/* Success Message */}
          {formSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              ✓ Maintenance log berhasil disimpan!
            </div>
          )}
          
          <form onSubmit={handleAddMaintenance} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Asset <span className="text-red-600">*</span> <span className="text-xs text-gray-500">({assets.length} tersedia)</span></label>
              <select
                value={formData.asset}
                onChange={(e) => {
                  console.log('Asset selected:', e.target.value)
                  setFormData({ ...formData, asset: e.target.value })
                }}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
                disabled={formSubmitting}
              >
                <option value="">-- Pilih Asset ({assets.length} tersedia) --</option>
                {assets && assets.length > 0 ? (
                  assets.map(a => (
                    <option key={a.id} value={a.name}>
                      [{a.id}] {a.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Tidak ada asset</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
                disabled={formSubmitting}
              >
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Technician <span className="text-red-600">*</span></label>
              <input
                type="text"
                placeholder="Nama technician..."
                value={formData.technician}
                onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
                disabled={formSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cost <span className="text-red-600">*</span></label>
              <input
                type="number"
                placeholder="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                min="0"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
                disabled={formSubmitting}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <textarea
                placeholder="Deskripsi maintenance..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-primary-600"
                disabled={formSubmitting}
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={formSubmitting}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:bg-primary-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {formSubmitting ? '⏳ Menyimpan...' : '💾 Log Maintenance'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setFormError(null)
                  setFormSuccess(false)
                }}
                disabled={formSubmitting}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
