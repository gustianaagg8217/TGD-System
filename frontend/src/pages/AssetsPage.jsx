import { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { LanguageContext } from '../context/LanguageContext'
import AssetFormModal from '../components/AssetFormModal'
import { assetService } from '../services/assetService'

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
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  // Check if user is admin or engineer
  const isAdmin = user?.role?.name === 'admin' || user?.role?.name === 'Admin' || user?.role?.name === 'engineer' || user?.role?.name === 'Engineer'

  // Fetch assets from API
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('📡 Fetching assets from API...')
        const response = await assetService.getAssets({ skip: 0, limit: 100 })
        
        console.log('📦 Response received:', response)
        
        // Handle both direct array and paginated response
        let assetList = []
        if (response && typeof response === 'object') {
          if (Array.isArray(response)) {
            // Direct array response
            assetList = response
            console.log('✅ Response is direct array, count:', assetList.length)
          } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
            // Axios response with data wrapper (paginated)
            assetList = response.data.items
            console.log('✅ Response is paginated (via response.data), count:', assetList.length, 'total:', response.data.total)
          } else if (response.items && Array.isArray(response.items)) {
            // Direct paginated response (fallback)
            assetList = response.items
            console.log('✅ Response is paginated (direct), count:', assetList.length, 'total:', response.total)
          } else {
            console.warn('⚠️ Response format unexpected:', Object.keys(response))
            if (response.data) {
              console.warn('   Data keys:', Object.keys(response.data))
            }
            assetList = []
          }
        }
        
        console.log('📊 Setting assets:', assetList.length, 'items')
        setAssets(assetList)
        
        if (assetList.length === 0) {
          console.warn('⚠️ No assets returned from API')
        }
      } catch (err) {
        console.error('❌ Error fetching assets:', err)
        console.error('   Message:', err.message)
        console.error('   Response:', err.response)
        setError(err.message || 'Gagal mengambil data asset')
        setAssets([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchAssets()
  }, [refreshTrigger])

  // Helper function to format value for display
  const formatValue = (value) => {
    if (!value) return '-'
    if (typeof value === 'string') return value
    const num = parseFloat(value)
    if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(1)} Miliar`
    if (num >= 1000) return `Rp ${(num / 1000).toFixed(1)} Juta`
    return `Rp ${num.toLocaleString('id-ID')}`
  }

  // Helper function to organize assets by type
  const organizeAssetsByType = (assetList) => {
    console.log('🔄 Organizing', assetList.length, 'assets by type')
    
    const organized = {
      mining: [],
      processing: [],
      infrastructure: [],
      fleet: [],
      land: [],
      digital: [],
      it: [],
      inventory: [],
      environmental: [],
    }

    assetList.forEach((asset, idx) => {
      const type = (asset.type || '').toLowerCase()
      const name = (asset.name || '').toLowerCase()
      const location = (asset.location || '').toLowerCase()
      
      console.log(`  Asset ${idx + 1}: type="${asset.type}", name="${asset.name}"`)
      
      let categorized = false
      
      // Check type field
      if (type.includes('machinery') || type.includes('equipment') || type.includes('excavator') || 
          type.includes('drill') || type.includes('mining') || type.includes('crusher') ||
          type.includes('motor') || type.includes('cnc') || type.includes('machine')) {
        organized.mining.push(asset)
        categorized = true
      } 
      else if (type.includes('processing') || type.includes('smelter') || type.includes('furnace')) {
        organized.processing.push(asset)
        categorized = true
      } 
      else if (type.includes('infrastructure') || type.includes('warehouse') || type.includes('workshop') ||
               type.includes('building') || type.includes('facility')) {
        organized.infrastructure.push(asset)
        categorized = true
      } 
      else if (type.includes('vehicle') || type.includes('truck') || type.includes('bus') || 
               type.includes('car') || type.includes('fleet')) {
        organized.fleet.push(asset)
        categorized = true
      } 
      else if (type.includes('land') || type.includes('concession') || type.includes('property')) {
        organized.land.push(asset)
        categorized = true
      } 
      else if (type.includes('digital') || type.includes('software') || type.includes('license') ||
               type.includes('application')) {
        organized.digital.push(asset)
        categorized = true
      } 
      else if (type.includes('it') || type.includes('server') || type.includes('computer') ||
               type.includes('network') || type.includes('hardware')) {
        organized.it.push(asset)
        categorized = true
      } 
      else if (type.includes('inventory') || type.includes('consumable') || type.includes('supply') ||
               type.includes('material') || type.includes('stock')) {
        organized.inventory.push(asset)
        categorized = true
      } 
      else if (type.includes('environmental') || type.includes('treatment') || type.includes('water') ||
               type.includes('waste')) {
        organized.environmental.push(asset)
        categorized = true
      }
      
      // If not categorized, put in mining as default
      if (!categorized) {
        console.log(`    → Categorized as: mining (default)`)
        organized.mining.push(asset)
      }
    })
    
    console.log('📊 Organization complete:', Object.entries(organized).map(([k, v]) => `${k}: ${v.length}`).join(', '))
    return organized
  }

  const organizedAssets = organizeAssetsByType(assets)

  // Delete asset handler
  const handleDeleteAsset = async (assetId) => {
    try {
      setDeleting(true)
      setDeleteError(null)
      console.log('🗑️ Deleting asset:', assetId)
      
      await assetService.deleteAsset(assetId)
      
      console.log('✅ Asset deleted successfully')
      // Remove from state
      setAssets(assets.filter(a => a.id !== assetId))
      setDeleteConfirm(null)
      setRefreshTrigger(prev => prev + 1)
      
      // Show success message via refresh
    } catch (err) {
      console.error('❌ Error deleting asset:', err)
      setDeleteError(err.message || 'Failed to delete asset')
    } finally {
      setDeleting(false)
    }
  }

  // Build dynamic categories with counts from API data
  const assetCategories = [
    { id: 'mining', name: '⛏️ Mining Equipment', count: organizedAssets.mining.length, value: '' },
    { id: 'processing', name: '🏭 Processing Facilities', count: organizedAssets.processing.length, value: '' },
    { id: 'infrastructure', name: '🏗️ Infrastructure', count: organizedAssets.infrastructure.length, value: '' },
    { id: 'fleet', name: '🚚 Fleet & Vehicles', count: organizedAssets.fleet.length, value: '' },
    { id: 'land', name: '🗺️ Land & Concessions', count: organizedAssets.land.length, value: '' },
    { id: 'digital', name: '💾 Digital Assets', count: organizedAssets.digital.length, value: '' },
    { id: 'it', name: '💻 IT Infrastructure', count: organizedAssets.it.length, value: '' },
    { id: 'inventory', name: '📦 Consumables', count: organizedAssets.inventory.length, value: '' },
    { id: 'environmental', name: '🌱 Environmental', count: organizedAssets.environmental.length, value: '' },
  ]

  // Use API data if available, otherwise empty fallback
  const miningEquipment = organizedAssets.mining
  const processingFacilities = organizedAssets.processing
  const infrastructure = organizedAssets.infrastructure
  const fleet = organizedAssets.fleet
  const land = organizedAssets.land
  const digital = organizedAssets.digital
  const itAssets = organizedAssets.it
  const consumables = organizedAssets.inventory
  const environmental = organizedAssets.environmental

  // Map category IDs to data
  const categoryDataMap = {
    mining: miningEquipment,
    processing: processingFacilities,
    infrastructure: infrastructure,
    fleet: fleet,
    land: land,
    digital: digital,
    it: itAssets,
    inventory: consumables,
    environmental: environmental,
  }

  const stats = {
    totalAssets: assets.length,
    totalValue: 'Rp ' + (assets.reduce((sum, a) => sum + (parseFloat(a.value) || 0), 0) / 1000000000).toFixed(1) + ' Miliar',
    categories: 9,
    activeStatus: assets.filter(a => a.status === 'active').length,
    maintenanceRequired: assets.filter(a => a.status === 'maintenance').length,
    offlineCount: assets.filter(a => a.status === 'inactive').length,
  }

  const renderContent = () => {
    // Show loading state
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Mengambil data asset...</p>
          </div>
        </div>
      )
    }

    // Show error state
    if (error && assets.length === 0) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
          <p className="font-bold">Gagal mengambil data asset</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      )
    }

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
                          categoryDataMap[filterCategory] || []
      
      return (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >
              <option value="mining">⛏️ Mining Equipment</option>
              <option value="processing">🏭 Processing Facilities</option>
              <option value="infrastructure">🏗️ Infrastructure</option>
              <option value="fleet">🚚 Fleet & Vehicles</option>
              <option value="land">🗺️ Land & Concessions</option>
              <option value="digital">💾 Digital Assets</option>
              <option value="it">💻 IT Infrastructure</option>
              <option value="inventory">📦 Consumables</option>
              <option value="environmental">🌱 Environmental</option>
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
                          <div className="flex gap-2">
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirm(asset)
                              }}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                            >
                              🗑️ {t('assets.delete')}
                            </button>
                          </div>
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
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteConfirm(asset)
                        }}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                      >
                        🗑️ {t('assets.delete')}
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
            { asset: 'Excavator CAT 390F', nextDue: '2026-04-10', status: 'On Schedule', cost: 'Rp 37.5 Juta' },
            { asset: 'Dredger KIP-3000', nextDue: '2026-04-28', status: 'Due Soon', cost: 'Rp 225 Juta' },
            { asset: 'Power Station 5MW', nextDue: '2026-04-01', status: 'Critical', cost: 'Rp 127.5 Juta' },
            { asset: 'Smelter Plant', nextDue: '2026-06-15', status: 'Scheduled', cost: 'Rp 375 Juta' },
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
              <div><strong>Total Purchase Value:</strong> <p className="text-xl font-bold text-primary-600">Rp 637.5 Miliar</p></div>
              <div><strong>Current Net Value:</strong> <p className="text-xl font-bold text-blue-600">Rp 430.5 Miliar</p></div>
              <div><strong>Total Depreciation:</strong> <p className="text-xl font-bold text-red-600">Rp 207 Miliar</p></div>
              <div><strong>Depreciation Rate:</strong> <p className="text-xl font-bold">32.4%</p></div>
            </div>
            
            <h4 className="font-bold mb-3">YTD Maintenance Costs by Category</h4>
            {[
              { category: 'Mining Equipment', amount: 'Rp 2.175 Miliar', percent: 30 },
              { category: 'Processing Facilities', amount: 'Rp 1.47 Miliar', percent: 20 },
              { category: 'Fleet Vehicles', amount: 'Rp 1.177 Miliar', percent: 16 },
              { category: 'Infrastructure', amount: 'Rp 1.347 Miliar', percent: 19 },
              { category: 'IT Systems', amount: 'Rp 180 Juta', percent: 2 },
              { category: 'Other', amount: 'Rp 915 Juta', percent: 13 },
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
                <>
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
                  <button
                    onClick={() => {
                      setDeleteConfirm(selectedAsset)
                      setSelectedAsset(null)
                    }}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    🗑️ {t('assets.deleteAsset')}
                  </button>
                </>
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

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-red-600">🗑️ {t('assets.deleteAsset')}</h2>
            <p className="text-gray-700 mb-2">{t('assets.deleteConfirm')}</p>
            <p className="text-gray-600 text-sm mb-6">{t('assets.deleteConfirmMessage')}</p>
            
            {deleteError && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-red-700 text-sm">
                {deleteError}
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm font-semibold">
                <strong>Asset:</strong> {deleteConfirm.name}
              </p>
              <p className="text-sm">
                <strong>Type:</strong> {deleteConfirm.type}
              </p>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  handleDeleteAsset(deleteConfirm.id)
                }}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {deleting ? '⏳ ' + t('forms.submitting') : '🗑️ ' + t('assets.delete')}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {t('forms.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
