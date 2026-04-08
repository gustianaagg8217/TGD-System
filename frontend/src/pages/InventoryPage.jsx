import { useState } from 'react'

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('inventory')
  const [selectedItem, setSelectedItem] = useState(null)

  const inventoryItems = [
    {
      id: 'CONS-001',
      name: 'Diesel Fuel - Premium Grade',
      category: 'Fuel',
      unit: 'Liters',
      quantity: 125000,
      reorderPoint: 50000,
      reorderQty: 100000,
      unitCost: 1.25,
      totalValue: 156250,
      supplier: 'Shell Indonesia',
      status: '✅ Adequate',
      leadTime: '7 days',
      dailyConsumption: 2500,
    },
    {
      id: 'CONS-002',
      name: 'Lubricating Oil - Heavy Machinery',
      category: 'Lubricants',
      unit: 'Liters',
      quantity: 8500,
      reorderPoint: 2000,
      reorderQty: 5000,
      unitCost: 18.50,
      totalValue: 157250,
      supplier: 'Mobil Lubricants',
      status: '✅ Adequate',
      leadTime: '14 days',
      weeklyConsumption: 350,
    },
    {
      id: 'CONS-003',
      name: 'Drill Bits - Tricone Type',
      category: 'Wear Items',
      unit: 'Pieces',
      quantity: 127,
      reorderPoint: 20,
      reorderQty: 50,
      unitCost: 2850,
      totalValue: 362250,
      supplier: 'Atlas Tools International',
      status: '✅ Adequate',
      leadTime: '21 days',
      monthlyConsumption: 15,
      sizes: ['6"', '7"', '8"', '9.5"', '12.25"'],
    },
    {
      id: 'CONS-004',
      name: 'Personal Protective Equipment (PPE)',
      category: 'Safety Equipment',
      unit: 'Mixed Items',
      quantity: 450,
      reorderPoint: 100,
      reorderQty: 200,
      unitCost: 'Various',
      totalValue: 42575,
      supplier: 'PT Safety Equipment Indonesia',
      status: '⚠️ Low Stock',
      leadTime: '10 days',
      items: ['Hard Hat (450)', 'Safety Vest (480)', 'Safety Boots (420)', 'Gloves (2000 pairs)', 'Respirators (280)'],
    },
    {
      id: 'CONS-005',
      name: 'Conveyor Belt - Spare Rolls',
      category: 'Processing Equipment Spares',
      unit: 'Pieces',
      quantity: 18,
      reorderPoint: 5,
      reorderQty: 10,
      unitCost: 8500,
      totalValue: 153000,
      supplier: 'ConveySys Global',
      status: '✅ Adequate',
      leadTime: '42 days',
      quarterlyConsumption: 3,
      specs: '1200mm width, 500kg capacity',
    },
    {
      id: 'CONS-006',
      name: 'Flotation Chemicals Bundle',
      category: 'Processing Chemicals',
      unit: 'Kilograms',
      quantity: 12000,
      reorderPoint: 2000,
      reorderQty: 8000,
      unitCost: 'Avg 12.50',
      totalValue: 138500,
      supplier: 'BASF Minerals',
      status: '✅ Adequate',
      leadTime: '30 days',
      monthlyConsumption: 1200,
      chemicals: ['SIBX (Xanthate)', 'Frother', 'pH Modifier', 'Depressant'],
    },
  ]

  const stats = {
    totalItems: inventoryItems.length,
    totalValue: '$1,009,825',
    lowStockItems: 1,
    reorderAlerts: 0,
  }

  const categories = [
    { name: 'Fuel', count: 1, value: '$156.25K' },
    { name: 'Lubricants', count: 1, value: '$157.25K' },
    { name: 'Wear Items', count: 1, value: '$362.25K' },
    { name: 'Safety Equipment', count: 1, value: '$42.57K' },
    { name: 'Equipment Spares', count: 1, value: '$153K' },
    { name: 'Processing Chemicals', count: 1, value: '$138.5K' },
  ]

  const renderContent = () => {
    if (activeTab === 'inventory') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary-600">
              <h3 className="text-gray-600 text-sm font-semibold">Total SKUs</h3>
              <p className="text-3xl font-bold text-primary-600">{stats.totalItems}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-600">
              <h3 className="text-gray-600 text-sm font-semibold">Inventory Value</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalValue}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-600">
              <h3 className="text-gray-600 text-sm font-semibold">Categories</h3>
              <p className="text-3xl font-bold text-green-600">6</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-red-600">
              <h3 className="text-gray-600 text-sm font-semibold">Low Stock Items</h3>
              <p className="text-3xl font-bold text-red-600">{stats.lowStockItems}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Inventory by Category</h3>
              {categories.map((cat, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span className="font-medium">{cat.name}</span>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{cat.count} item</div>
                    <div className="font-bold">{cat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Stock Level Alerts</h3>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded border-l-4 border-green-600">
                  <p className="font-semibold text-green-900">✅ 5 Items - Adequate Stock</p>
                  <p className="text-sm text-green-700">All above reorder point</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-600">
                  <p className="font-semibold text-yellow-900">⚠️ 1 Item - Low Stock</p>
                  <p className="text-sm text-yellow-700">PPE items approaching reorder</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Item Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Category</th>
                  <th className="px-6 py-4 text-center font-semibold">Qty On Hand</th>
                  <th className="px-6 py-4 text-center font-semibold">Reorder Point</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedItem(item)}>
                    <td className="px-6 py-4 font-medium">{item.name}</td>
                    <td className="px-6 py-4 text-gray-600">{item.category}</td>
                    <td className="px-6 py-4 text-center">{item.quantity.toLocaleString()} {item.unit}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{item.reorderPoint.toLocaleString()}</td>
                    <td className="px-6 py-4">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    if (activeTab === 'reorders') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-bold mb-4">Reorder Schedule & Suppliers</h3>
          {inventoryItems.filter(i => i.quantity <= i.reorderPoint * 1.2).map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-gray-600">Supplier: {item.supplier}</p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-bold ${item.quantity <= item.reorderPoint ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {item.quantity <= item.reorderPoint ? 'ORDER NOW' : 'Monitor'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                <div>
                  <p className="text-gray-600">Current Stock</p>
                  <p className="font-bold">{item.quantity.toLocaleString()} {item.unit}</p>
                </div>
                <div>
                  <p className="text-gray-600">Lead Time</p>
                  <p className="font-bold">{item.leadTime}</p>
                </div>
                <div>
                  <p className="text-gray-600">Reorder Qty</p>
                  <p className="font-bold">{item.reorderQty.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (activeTab === 'suppliers') {
      const suppliers = [...new Set(inventoryItems.map(i => i.supplier))].map(supp => ({
        name: supp,
        items: inventoryItems.filter(i => i.supplier === supp).length,
        leadTime: inventoryItems.find(i => i.supplier === supp)?.leadTime,
        status: '✅ Active'
      }))

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supp, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6 border-t-4 border-primary-600">
              <h3 className="font-bold text-lg mb-2">{supp.name}</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Items Supplied:</strong> {supp.items}</p>
                <p><strong>Lead Time:</strong> {supp.leadTime}</p>
                <p><strong>Status:</strong> {supp.status}</p>
              </div>
              <button className="mt-4 w-full border border-primary-600 text-primary-600 px-4 py-2 rounded hover:bg-primary-50">
                Contact Supplier
              </button>
            </div>
          ))}
        </div>
      )
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">📦 Inventory & Consumables</h1>
        <p className="text-gray-600 mt-2">Fuel, spares, chemicals, PPE, and consumables for mining operations</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-lg shadow p-2">
        {['inventory', 'reorders', 'suppliers'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded font-medium transition ${
              activeTab === tab ? 'bg-primary-600 text-white' : 'text-gray-800 hover:bg-gray-100'
            }`}
          >
            {tab === 'inventory' && '📊 Inventory'}
            {tab === 'reorders' && '🔄 Reorders'}
            {tab === 'suppliers' && '🤝 Suppliers'}
          </button>
        ))}
      </div>

      {renderContent()}

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{selectedItem.name}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div><p className="text-gray-600">Category</p><p className="font-bold">{selectedItem.category}</p></div>
              <div><p className="text-gray-600">Unit</p><p className="font-bold">{selectedItem.unit}</p></div>
              <div><p className="text-gray-600">Current Stock</p><p className="font-bold">{selectedItem.quantity.toLocaleString()}</p></div>
              <div><p className="text-gray-600">Total Value</p><p className="font-bold">${selectedItem.totalValue.toLocaleString()}</p></div>
              <div><p className="text-gray-600">Supplier</p><p className="font-bold">{selectedItem.supplier}</p></div>
              <div><p className="text-gray-600">Lead Time</p><p className="font-bold">{selectedItem.leadTime}</p></div>
            </div>
            {selectedItem.chemicals && (
              <div className="mb-4">
                <p className="font-bold mb-2">Chemicals Included:</p>
                <ul className="text-sm text-gray-700">{selectedItem.chemicals.map((c, i) => <li key={i}>• {c}</li>)}</ul>
              </div>
            )}
            <button onClick={() => setSelectedItem(null)} className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
