import { useState, useEffect } from 'react'

export default function ITAssetsPage() {
  const [assets, setAssets] = useState([])
  const [filteredAssets, setFilteredAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [activeTab, setActiveTab] = useState('inventory')
  const [viewMode, setViewMode] = useState('list')

  const [formData, setFormData] = useState({
    assetTag: '',
    name: '',
    category: 'servers',
    type: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    assignedTo: '',
    status: 'operational',
    location: '',
    warranty: '',
    description: '',
  })

  const categories = [
    { value: 'servers', label: '🖥️ Servers' },
    { value: 'network', label: '🌐 Network Equipment' },
    { value: 'storage', label: '💾 Storage Devices' },
    { value: 'workstations', label: '💻 Workstations' },
    { value: 'peripherals', label: '🖱️ Peripherals' },
    { value: 'mobile', label: '📱 Mobile Devices' },
    { value: 'software', label: '📦 Software Licenses' },
    { value: 'iot', label: '🔌 IoT Devices' },
  ]

  const statuses = ['operational', 'maintenance', 'retired', 'disposed', 'on-loan']

  useEffect(() => {
    setTimeout(() => {
      const assetsData = [
        {
          id: 1,
          assetTag: 'IT-SRV-001',
          name: 'Database Server - Production',
          category: 'servers',
          type: 'Rack-mount Server',
          manufacturer: 'Dell',
          model: 'PowerEdge R750',
          serialNumber: 'NTX4J42',
          purchaseDate: '2023-03-15',
          purchasePrice: 45000,
          currentValue: 38000,
          assignedTo: 'IT Department',
          status: 'operational',
          location: 'Data Center - Rack A3',
          warranty: '2026-03-14',
          cpu: '2x Intel Xeon Gold 6326',
          ram: '512GB DDR4',
          storage: '2x 1.92TB SSD NVMe',
          maintenanceLogs: [
            { date: '2026-04-01', service: 'Hardware Inspection', cost: 500, notes: 'All components normal' },
            { date: '2026-02-15', service: 'Security Update', cost: 300, notes: 'Patched vulnerabilities' },
          ],
        },
        {
          id: 2,
          assetTag: 'IT-NET-001',
          name: 'Core Switch - Main',
          category: 'network',
          type: 'Managed Switch',
          manufacturer: 'Cisco',
          model: 'Catalyst 9500-48Y4C',
          serialNumber: 'JAB1917JMVF',
          purchaseDate: '2022-11-20',
          purchasePrice: 18000,
          currentValue: 13500,
          assignedTo: 'Network Team',
          status: 'operational',
          location: 'Network Room - Floor 2',
          warranty: '2025-11-19',
          ports: '48x 1GbE + 4x 100GbE',
          maintenanceLogs: [
            { date: '2026-03-20', service: 'Firmware Update', cost: 400, notes: 'Updated to latest version' },
          ],
        },
        {
          id: 3,
          assetTag: 'IT-WS-001',
          name: 'Engineering Workstation - CAD',
          category: 'workstations',
          type: 'Desktop Workstation',
          manufacturer: 'HP',
          model: 'Z6 G4 Tower',
          serialNumber: 'CN7AAABCD1234',
          purchaseDate: '2024-01-10',
          purchasePrice: 8500,
          currentValue: 7800,
          assignedTo: 'Ali Mansur',
          status: 'operational',
          location: 'Engineering Dept - Room 302',
          warranty: '2027-01-09',
          cpu: 'Intel Xeon W5-3435X',
          ram: '128GB DDR5',
          gpu: 'NVIDIA RTX 5880 Ada',
          maintenanceLogs: [
            { date: '2026-03-15', service: 'GPU Driver Update', cost: 200, notes: 'Updated to latest CUDA' },
          ],
        },
        {
          id: 4,
          assetTag: 'IT-LIC-001',
          name: 'Microsoft Office 365 - Enterprise',
          category: 'software',
          type: 'SaaS License',
          manufacturer: 'Microsoft',
          model: 'Office 365 E5',
          serialNumber: 'MSO-365-E5-1000',
          purchaseDate: '2024-01-01',
          purchasePrice: 5000,
          currentValue: 4500,
          assignedTo: 'IT Department',
          status: 'operational',
          location: 'Cloud',
          warranty: '2025-12-31',
          seats: 100,
          seatsUsed: 85,
          seatsAvailable: 15,
          licenseType: 'Subscription',
          renewalDate: '2025-12-31',
          maintenanceLogs: [],
        },
        {
          id: 5,
          assetTag: 'IT-PHN-001',
          name: 'iPhone 15 Pro',
          category: 'mobile',
          type: 'Smartphone',
          manufacturer: 'Apple',
          model: 'iPhone 15 Pro',
          serialNumber: 'AABB11223344',
          purchaseDate: '2024-03-01',
          purchasePrice: 1800,
          currentValue: 1400,
          assignedTo: 'Sarah Wijaya',
          status: 'operational',
          location: 'Field Operations',
          warranty: '2027-03-01',
          storage: '256GB',
          maintenanceLogs: [],
        },
        {
          id: 6,
          assetTag: 'IT-STO-001',
          name: 'Enterprise SAN Storage',
          category: 'storage',
          type: 'Storage Array',
          manufacturer: 'NetApp',
          model: 'AFF A900',
          serialNumber: '901900001234',
          purchaseDate: '2023-06-01',
          purchasePrice: 120000,
          currentValue: 95000,
          assignedTo: 'Storage Team',
          status: 'operational',
          location: 'Data Center - Rack B1',
          warranty: '2026-06-01',
          capacity: '600TB',
          maintenanceLogs: [
            { date: '2026-04-05', service: 'Array Expansion', cost: 8000, notes: 'Added 100TB capacity' },
          ],
        },
      ]
      setAssets(assetsData)
      setFilteredAssets(assetsData)
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    let filtered = assets

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(a => a.category === filterCategory)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus)
    }

    setFilteredAssets(filtered)
  }, [searchTerm, filterCategory, filterStatus, assets])

  const handleAddAsset = (e) => {
    e.preventDefault()
    const newAsset = {
      id: assets.length + 1,
      ...formData,
      currentValue: parseFloat(formData.purchasePrice) * 0.8,
      maintenanceLogs: [],
    }
    setAssets([...assets, newAsset])
    setFormData({
      assetTag: '',
      name: '',
      category: 'servers',
      type: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      purchaseDate: '',
      purchasePrice: '',
      assignedTo: '',
      status: 'operational',
      location: '',
      warranty: '',
      description: '',
    })
    setShowAddForm(false)
  }

  const getStatusColor = (status) => {
    const colors = {
      operational: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      retired: 'bg-gray-100 text-gray-800',
      disposed: 'bg-red-100 text-red-800',
      'on-loan': 'bg-blue-100 text-blue-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const stats = {
    total: assets.length,
    operational: assets.filter(a => a.status === 'operational').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length,
    totalValue: assets.reduce((sum, a) => sum + (a.currentValue || a.purchasePrice), 0),
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading IT assets...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">💻 IT Asset Management</h1>
          <p className="text-gray-600 mt-2">Track servers, network equipment, workstations, software licenses, and IoT devices</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          + Register Asset
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Assets</h3>
          <p className="text-4xl font-bold text-primary-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Operational</h3>
          <p className="text-4xl font-bold text-green-600">{stats.operational}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Value</h3>
          <p className="text-3xl font-bold text-blue-600">${(stats.totalValue / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">In Maintenance</h3>
          <p className="text-4xl font-bold text-yellow-600">{stats.maintenance}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Assets</label>
            <input
              type="text"
              placeholder="Name, tag, serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Asset List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Asset Name</th>
              <th className="px-6 py-4 text-left font-semibold">Tag</th>
              <th className="px-6 py-4 text-left font-semibold">Category</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-left font-semibold">Assigned To</th>
              <th className="px-6 py-4 text-left font-semibold">Value</th>
              <th className="px-6 py-4 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(a => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{a.name}</td>
                <td className="px-6 py-4 font-mono text-xs">{a.assetTag}</td>
                <td className="px-6 py-4 text-sm">{categories.find(c => c.value === a.category)?.label}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(a.status)}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{a.assignedTo || 'Unassigned'}</td>
                <td className="px-6 py-4 font-medium">${(a.currentValue || a.purchasePrice).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedAsset(a)}
                    className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Asset Details Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto shadow-xl">
            <div className="p-6 border-b flex justify-between items-start sticky top-0 bg-white">
              <div>
                <h2 className="text-2xl font-bold">{selectedAsset.name}</h2>
                <p className="text-gray-600 text-sm mt-1">{selectedAsset.assetTag}</p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Manufacturer</p>
                  <p className="font-bold text-blue-700">{selectedAsset.manufacturer}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Model</p>
                  <p className="font-bold text-green-700">{selectedAsset.model}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Current Value</p>
                  <p className="font-bold text-purple-700">${(selectedAsset.currentValue || selectedAsset.purchasePrice).toLocaleString()}</p>
                </div>
                <div className={`p-4 rounded-lg ${getStatusColor(selectedAsset.status)}`}>
                  <p className="text-sm">Status</p>
                  <p className="font-bold">{selectedAsset.status}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3">Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><span className="font-medium">Serial:</span> {selectedAsset.serialNumber}</p>
                  <p><span className="font-medium">Assigned To:</span> {selectedAsset.assignedTo || 'Unassigned'}</p>
                  <p><span className="font-medium">Location:</span> {selectedAsset.location}</p>
                  <p><span className="font-medium">Warranty:</span> {selectedAsset.warranty}</p>
                  <p><span className="font-medium">Purchase Date:</span> {selectedAsset.purchaseDate}</p>
                  <p><span className="font-medium">Purchase Price:</span> ${selectedAsset.purchasePrice.toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAsset(null)}
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
