import { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { LanguageContext } from '../context/LanguageContext'
import AssetFormModal from '../components/AssetFormModal'

export default function AssetsPage() {
  const { user } = useContext(AuthContext)
  const { t } = useContext(LanguageContext)
  
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showAssetForm, setShowAssetForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Check if user is admin or engineer
  const isAdmin = user?.role?.name === 'admin' || user?.role?.name === 'Admin' || user?.role?.name === 'engineer' || user?.role?.name === 'Engineer'

  const assetCategories = [
    { id: 'mining', name: '⛏️ Mining Equipment', count: 5, value: '$8.2M' },
    { id: 'processing', name: '🏭 Processing Facilities', count: 3, value: '$18.5M' },
    { id: 'infrastructure', name: '🏗️ Infrastructure', count: 4, value: '$2.4M' },
    { id: 'fleet', name: '🚚 Fleet & Vehicles', count: 5, value: '$3.9M' },
    { id: 'land', name: '🗺️ Land & Concessions', count: 3, value: '$12M+' },
    { id: 'digital', name: '💾 Digital Assets', count: 6, value: '$3.5M' },
    { id: 'it', name: '💻 IT Infrastructure', count: 6, value: '$180K' },
    { id: 'inventory', name: '📦 Consumables', count: 6, value: '$869K' },
    { id: 'environmental', name: '🌱 Environmental', count: 5, value: '$2.5M+' },
  ]

  const miningEquipment = [
    { id: 'EQP-001', name: 'Excavator CAT 390F', type: 'Excavator', location: 'Block Alpha', value: '$1.05M', status: '🟢 Operational', hours: 8500 },
    { id: 'EQP-002', name: 'Dozer Komatsu D455AX', type: 'Bulldozer', location: 'Block Beta', value: '$840K', status: '🟢 Operational', hours: 12400 },
    { id: 'EQP-003', name: 'Dump Truck Volvo FMX', type: 'Haul Truck', location: 'Transport Route', value: '$337K', status: '🟢 Operational', hours: 5200 },
    { id: 'EQP-004', name: 'Dredger KIP-3000 (Offshore)', type: 'Dredger', location: 'Block Delta', value: '$5.95M', status: '🟡 Maintenance Required', capacity: '3000 t/h' },
    { id: 'EQP-005', name: 'Drill Rig Atlas Copco D9-13', type: 'Drill', location: 'Block Alpha', value: '$455K', status: '🟢 Operational', depth: '300m' },
  ]

  const processingFacilities = [
    { id: 'FAC-001', name: 'Tin Smelter Plant', type: 'Smelter/Furnace', location: 'Block Omega', value: '$7.2M', status: '🟡 Scheduled Maintenance', capacity: '250 tpd', efficiency: '94.5%' },
    { id: 'FAC-002', name: 'Concentration Plant', type: 'Flotation Circuit', location: 'Block Omega', value: '$2.28M', status: '🟢 Operational', capacity: '500 tpd', recovery: '97.2%' },
    { id: 'FAC-003', name: 'Slurry Storage Tanks', type: 'Storage', location: 'Storage Area', value: '$1.57M', status: '🟡 Inspection Due', capacity: '50,000 m³', content: 'Tin concentrate' },
  ]

  const infrastructure = [
    { id: 'INF-001', name: 'Main Warehouse', type: 'Warehouse', area: '5,000 m²', value: '$840K', status: '🟢 Good', utilization: '78%' },
    { id: 'INF-002', name: 'Maintenance Workshop', type: 'Workshop', area: '2,500 m²', value: '$480K', status: '🟡 Roof Maintenance Needed', bays: 6 },
    { id: 'INF-003', name: 'Power Station (5MW)', type: 'Power Generator', location: 'Utility Block', value: '$595K', status: '🟢 Good', capacity: '5 MW' },
    { id: 'INF-004', name: 'Port & Jetty', type: 'Port Facility', location: 'Offshore 5km', value: '$2.75M', status: '🟡 Structural Inspection Due', throughput: '500k tonnes/yr' },
  ]

  const stats = {
    totalAssets: 38,
    totalValue: '$28.7M',
    categories: 9,
    activeStatus: '32',
    maintenanceRequired: '4',
    offlineCount: '2',
  }

  const renderContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary-600">
              <h3 className="text-gray-600 text-sm font-semibold">Total Assets</h3>
              <p className="text-3xl font-bold text-primary-600">{stats.totalAssets}</p>
              <p className="text-xs text-gray-500 mt-1">Across 9 categories</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-600">
              <h3 className="text-gray-600 text-sm font-semibold">Total Value</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalValue}</p>
              <p className="text-xs text-gray-500 mt-1">Current net value</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-600">
              <h3 className="text-gray-600 text-sm font-semibold">Active Assets</h3>
              <p className="text-3xl font-bold text-green-600">{stats.activeStatus}</p>
              <p className="text-xs text-gray-500 mt-1">Operational</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-red-600">
              <h3 className="text-gray-600 text-sm font-semibold">Attention Needed</h3>
              <p className="text-3xl font-bold text-red-600">{stats.maintenanceRequired}</p>
              <p className="text-xs text-gray-500 mt-1">Maintenance or repair</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-6">Asset Categories (9 Total)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assetCategories.map((cat, idx) => (
                <div key={idx} className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer" onClick={() => { setFilterCategory(cat.id); setActiveTab('by-category'); }}>
                  <p className="text-lg font-semibold mb-2">{cat.name}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary-600">{cat.count}</span>
                    <span className="text-gray-600 text-sm">{cat.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (activeTab === 'by-category') {
      const filteredList = filterCategory === 'all' ? miningEquipment : 
                          filterCategory === 'mining' ? miningEquipment :
                          filterCategory === 'processing' ? processingFacilities :
                          filterCategory === 'infrastructure' ? infrastructure : []
      
      return (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="mining">Mining Equipment</option>
              <option value="processing">Processing Facilities</option>
              <option value="infrastructure">Infrastructure</option>
            </select>
            <div className="flex gap-2 flex-wrap">
              {isAdmin && (
                <button
                  onClick={() => {
                    setEditingAsset(null)
                    setShowAssetForm(true)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  ➕ {t('assets.addAsset')}
                </button>
              )}
              <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'border'}`}>List</button>
              <button onClick={() => setViewMode('grid')} className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'border'}`}>Grid</button>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">{t('assets.assetName')}</th>
                    <th className="px-6 py-4 text-left font-semibold">{t('assets.type')}</th>
                    <th className="px-6 py-4 text-left font-semibold">{t('assets.location')}</th>
                    <th className="px-6 py-4 text-left font-semibold">{t('assets.value')}</th>
                    <th className="px-6 py-4 text-left font-semibold">{t('assets.status')}</th>
                    {isAdmin && <th className="px-6 py-4 text-left font-semibold">{t('assets.action')}</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((asset, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium cursor-pointer" onClick={() => setSelectedAsset(asset)}>{asset.name}</td>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedAsset(asset)}>{asset.type}</td>
                      <td className="px-6 py-4 text-gray-600 cursor-pointer" onClick={() => setSelectedAsset(asset)}>{asset.location}</td>
                      <td className="px-6 py-4 font-semibold cursor-pointer" onClick={() => setSelectedAsset(asset)}>{asset.value}</td>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedAsset(asset)}>{asset.status}</td>
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingAsset(asset)
                              setShowAssetForm(true)
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                          >
                            ✏️ {t('assets.edit')}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredList.map((asset, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer relative group"
                  onClick={() => setSelectedAsset(asset)}
                >
                  {isAdmin && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingAsset(asset)
                          setShowAssetForm(true)
                        }}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                      >
                        ✏️ {t('assets.edit')}
                      </button>
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-2">{asset.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{asset.type}</p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Location:</strong> {asset.location}</p>
                    <p><strong>Value:</strong> <span className="font-bold">{asset.value}</span></p>
                    <p className="pt-2">{asset.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'maintenance') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-bold mb-4">Maintenance Schedule & History</h3>
          {[
            { asset: 'Excavator CAT 390F', nextDue: '2026-04-10', status: 'On Schedule', cost: '$2,500' },
            { asset: 'Dredger KIP-3000', nextDue: '2026-04-28', status: 'Due Soon', cost: '$15,000' },
            { asset: 'Power Station 5MW', nextDue: '2026-04-01', status: 'Critical', cost: '$8,500' },
            { asset: 'Smelter Plant', nextDue: '2026-06-15', status: 'Scheduled', cost: '$25,000' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4 border-l-4 border-primary-600">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{item.asset}</p>
                  <p className="text-sm text-gray-600">Next Due: {item.nextDue}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded text-xs font-bold ${item.status === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {item.status}
                  </span>
                  <p className="text-sm font-bold mt-1">Est: {item.cost}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (activeTab === 'depreciation') {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold">Asset Depreciation & Financial Tracking</h3>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div><strong>Total Purchase Value:</strong> <p className="text-xl font-bold text-primary-600">$42.5M</p></div>
              <div><strong>Current Net Value:</strong> <p className="text-xl font-bold text-blue-600">$28.7M</p></div>
              <div><strong>Total Depreciation:</strong> <p className="text-xl font-bold text-red-600">$13.8M</p></div>
              <div><strong>Depreciation Rate:</strong> <p className="text-xl font-bold">32.4%</p></div>
            </div>
            
            <h4 className="font-bold mb-3">YTD Maintenance Costs by Category</h4>
            {[
              { category: 'Mining Equipment', amount: '$145,000', percent: 30 },
              { category: 'Processing Facilities', amount: '$98,000', percent: 20 },
              { category: 'Fleet Vehicles', amount: '$78,500', percent: 16 },
              { category: 'Infrastructure', amount: '$89,800', percent: 19 },
              { category: 'IT Systems', amount: '$12,000', percent: 2 },
              { category: 'Other', amount: '$61,000', percent: 13 },
            ].map((item, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{item.category}</span>
                  <span className="font-bold">{item.amount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-primary-600 rounded-full h-3" style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">🏭 {t('assets.title')}</h1>
        <p className="text-gray-600 mt-2">{t('assets.subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-lg shadow p-2">
        {['overview', 'by-category', 'maintenance', 'depreciation'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded font-medium transition ${
              activeTab === tab ? 'bg-primary-600 text-white' : 'text-gray-800 hover:bg-gray-100'
            }`}
          >
            {tab === 'overview' && '📊 ' + t('assets.overview')}
            {tab === 'by-category' && '📂 ' + t('assets.category')}
            {tab === 'maintenance' && '🔧 ' + t('assets.maintenance')}
            {tab === 'depreciation' && '💰 ' + t('assets.financial')}
          </button>
        ))}
      </div>

      {renderContent()}

      {selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{selectedAsset.name}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-600">{t('assets.type')}</p><p className="font-bold">{selectedAsset.type}</p></div>
              <div><p className="text-gray-600">{t('assets.location')}</p><p className="font-bold">{selectedAsset.location}</p></div>
              <div><p className="text-gray-600">{t('assets.value')}</p><p className="font-bold text-primary-600">{selectedAsset.value}</p></div>
              <div><p className="text-gray-600">{t('assets.status')}</p><p className="font-bold">{selectedAsset.status}</p></div>
            </div>
            <div className="flex gap-3 mt-6">
              {isAdmin && (
                <button
                  onClick={() => {
                    setEditingAsset(selectedAsset)
                    setShowAssetForm(true)
                    setSelectedAsset(null)
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  ✏️ {t('assets.editAsset')}
                </button>
              )}
              <button
                onClick={() => setSelectedAsset(null)}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                {t('assets.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssetForm && (
        <AssetFormModal
          asset={editingAsset}
          isEdit={!!editingAsset}
          onClose={() => {
            setShowAssetForm(false)
            setEditingAsset(null)
          }}
          onSave={() => {
            setRefreshTrigger(prev => prev + 1)
            setShowAssetForm(false)
            setEditingAsset(null)
          }}
        />
      )}
    </div>
  )
}
