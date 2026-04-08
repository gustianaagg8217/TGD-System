import { useState } from 'react'

export default function FleetPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  const vehicles = [
    {
      id: 'VEH-001',
      name: 'Haul Truck HT-001',
      type: 'Haul Truck',
      manufacturer: 'Volvo',
      model: 'FMX 6x4',
      year: 2022,
      registration: 'MN-7743-AB',
      location: '⛏️ Block Alpha - Primary Route',
      status: '🟢 Operational',
      fuelType: 'Diesel',
      fuelCapacity: 350,
      currentFuel: 280,
      payload: 42,
      odometer: 125400,
      engineHours: 8540,
      lastService: '2026-03-15',
      nextService: '2026-04-15',
      fuelConsumption: 0.22,
      maintenance_ytd: 8500,
      driver: 'Ahmad Wijaya',
      efficiency: '94%',
    },
    {
      id: 'VEH-002',
      name: 'Loader LDR-002',
      type: 'Wheel Loader',
      manufacturer: 'Komatsu',
      model: 'WA480-8',
      year: 2020,
      registration: 'MN-5521-CD',
      location: '⛏️ Block Gamma - Loading Area',
      status: '🟢 Operational',
      fuelType: 'Diesel',
      fuelCapacity: 330,
      currentFuel: 165,
      payload: 32,
      operatingHours: 14250,
      bucketCapacity: 3.2,
      lastService: '2026-03-10',
      nextService: '2026-04-10',
      maintenance_ytd: 12300,
      operator: 'Budi Santoso',
      efficiency: '91%',
    },
    {
      id: 'VEH-003',
      name: 'Utility Vehicle - Admin Transport',
      type: 'Pickup Truck',
      manufacturer: 'Toyota',
      model: 'Hilux 4x4 Double Cab',
      year: 2023,
      registration: 'MN-1234-EF',
      location: '🏢 Base Camp - Office Area',
      status: '🟢 Operational',
      fuelType: 'Diesel',
      fuelCapacity: 80,
      currentFuel: 50,
      payload: 1.5,
      odometer: 28500,
      lastService: '2026-03-18',
      nextService: '2026-04-18',
      passengers: 6,
      maintenance_ytd: 600,
      driver: 'Management Staff',
      efficiency: '98%',
    },
    {
      id: 'VEH-004',
      name: 'Supply Vessel - MV Integritas',
      type: 'Supply Boat (Offshore)',
      manufacturer: 'Korean Shipbuilder',
      model: 'OSV 3000 DP',
      year: 2018,
      registration: 'ID-2018-OSV-001',
      location: '⛵ Offshore Supply Base - Block Delta',
      status: '🟢 Operational',
      fuelType: 'Marine Diesel Oil (MDO)',
      fuelCapacity: 350,
      currentFuel: 250,
      payload: 400,
      vesselLength: 76,
      vesselBeam: 17,
      draft: 5.2,
      grossTonnage: 3000,
      lastService: '2026-02-28',
      nextService: '2026-05-28',
      maintenance_ytd: 95000,
      captain: 'Capt. Soekarno M',
      dynamicPositioning: 'Yes (DP2)',
      crewCapacity: 25,
    },
    {
      id: 'VEH-005',
      name: 'Barge - TIN-BARGE-01',
      type: 'Bulk Cargo Barge',
      manufacturer: 'Tanjung Perak Shipyard',
      model: 'OBM 4500 DWT',
      year: 2015,
      registration: 'ID-2015-BARGE-07',
      location: '⛵ Offshore Anchorage',
      status: '🟢 Operational',
      payload: 4500,
      bargeLength: 108,
      bargeBeam: 19,
      draft: 4.5,
      cargoVolume: 6800,
      lastService: '2026-01-15',
      nextService: '2026-07-15',
      maintenance_ytd: 28000,
      towVessel: 'MV Integritas',
      cargoTripsYTD: 42,
      totalCargoShipped: 189000,
    },
  ]

  const stats = {
    total: vehicles.length,
    operational: 5,
    underMaintenance: 0,
    retired: 0,
    totalValue: '$3.9M',
  }

  const fuelEfficiencyData = [
    { vehicle: 'HT-001 (Haul Truck)', efficiency: 94, target: 95 },
    { vehicle: 'LDR-002 (Loader)', efficiency: 91, target: 92 },
    { vehicle: 'Pickup Truck', efficiency: 98, target: 96 },
    { vehicle: 'MV Integritas', efficiency: 89, target: 91 },
  ]

  const renderContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary-600">
              <h3 className="text-gray-600 text-sm font-semibold">Total Vehicles</h3>
              <p className="text-3xl font-bold text-primary-600">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-600">
              <h3 className="text-gray-600 text-sm font-semibold">Operational</h3>
              <p className="text-3xl font-bold text-green-600">{stats.operational}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-600">
              <h3 className="text-gray-600 text-sm font-semibold">Fleet Value</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalValue}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-600">
              <h3 className="text-gray-600 text-sm font-semibold">Avg Fuel Efficiency</h3>
              <p className="text-3xl font-bold text-purple-600">93%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Vehicle Breakdown by Type</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span>Haul Trucks</span><span className="font-bold">1</span></div>
                <div className="flex justify-between"><span>Loaders</span><span className="font-bold">1</span></div>
                <div className="flex justify-between"><span>Utility Vehicles</span><span className="font-bold">1</span></div>
                <div className="flex justify-between"><span>Supply Vessel</span><span className="font-bold">1</span></div>
                <div className="flex justify-between"><span>Barges</span><span className="font-bold">1</span></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Fleet Status Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1"><span>Operational</span><span>100%</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-green-500 h-3" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span>Under Maintenance</span><span>0%</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-yellow-500 h-3" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (activeTab === 'fleet') {
      return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Vehicle</th>
                <th className="px-6 py-4 text-left font-semibold">Type</th>
                <th className="px-6 py-4 text-left font-semibold">Location</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Capacity</th>
                <th className="px-6 py-4 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{v.name}</td>
                  <td className="px-6 py-4">{v.type}</td>
                  <td className="px-6 py-4 text-gray-600">{v.location}</td>
                  <td className="px-6 py-4">{v.status}</td>
                  <td className="px-6 py-4">{v.payload || v.cargoVolume || 'N/A'}</td>
                  <td className="px-6 py-4"><button onClick={() => setSelectedVehicle(v)} className="text-primary-600 hover:text-primary-800">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (activeTab === 'fuel') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4">Fuel Consumption & Efficiency</h3>
            {fuelEfficiencyData.map((item, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{item.vehicle}</span>
                  <span className="font-bold">{item.efficiency}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className={`h-3 rounded-full ${item.efficiency >= item.target ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${item.efficiency}%` }}></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">Target: {item.target}%</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4">Fleet Fuel Statistics</h3>
            <div className="space-y-4">
              <div className="border-b pb-3">
                <p className="text-gray-600 text-sm">Current Fleet Fuel Level</p>
                <p className="text-3xl font-bold text-primary-600">745 L</p>
                <p className="text-xs text-gray-600">Out of 1,195 L capacity</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">YTD Fuel Cost</p>
                <p className="text-2xl font-bold text-blue-600">$156,250</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Average Daily Consumption</p>
                <p className="text-2xl font-bold">2,500 L/day</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (activeTab === 'maintenance') {
      return (
        <div className="space-y-4">
          <h3 className="font-bold text-lg mb-4">Maintenance Schedule</h3>
          {[
            { vehicle: 'HT-001 (Haul Truck)', nextService: '2026-04-15', cost: '$2,500', status: 'On Schedule' },
            { vehicle: 'LDR-002 (Loader)', nextService: '2026-04-10', cost: '$3,200', status: 'On Schedule' },
            { vehicle: 'MV Integritas', nextService: '2026-05-28', cost: '$15,000', status: 'On Schedule' },
            { vehicle: 'Pickup Truck', nextService: '2026-04-18', cost: '$800', status: 'Due Soon' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4 border-l-4 border-primary-600">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{item.vehicle}</p>
                  <p className="text-sm text-gray-600">Due: {item.nextService}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded text-xs font-bold bg-green-100 text-green-800">{item.status}</span>
                  <p className="text-sm font-bold mt-1">Est: {item.cost}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">🚚 Fleet & Vehicle Management</h1>
        <p className="text-gray-600 mt-2">Mining equipment, haul trucks, loads, vessels, and barges for PT. ANDA SELALU UNTUNG</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-lg shadow p-2">
        {['overview', 'fleet', 'fuel', 'maintenance'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded font-medium transition ${
              activeTab === tab ? 'bg-primary-600 text-white' : 'text-gray-800 hover:bg-gray-100'
            }`}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'fleet' && '🚗 Fleet Directory'}
            {tab === 'fuel' && '⛽ Fuel Management'}
            {tab === 'maintenance' && '🔧 Maintenance'}
          </button>
        ))}
      </div>

      {renderContent()}

      {selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{selectedVehicle.name}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-600">Type</p><p className="font-bold">{selectedVehicle.type}</p></div>
              <div><p className="text-gray-600">Registration</p><p className="font-bold">{selectedVehicle.registration}</p></div>
              <div><p className="text-gray-600">Location</p><p className="font-bold">{selectedVehicle.location}</p></div>
              <div><p className="text-gray-600">Status</p><p className="font-bold">{selectedVehicle.status}</p></div>
              <div><p className="text-gray-600">Model</p><p className="font-bold">{selectedVehicle.manufacturer} {selectedVehicle.model}</p></div>
              <div><p className="text-gray-600">Year</p><p className="font-bold">{selectedVehicle.year}</p></div>
            </div>
            {selectedVehicle.payload && <div className="mt-4"><strong>Payload Capacity:</strong> {selectedVehicle.payload} tonnes</div>}
            {selectedVehicle.fuelCapacity && <div><strong>Fuel Capacity:</strong> {selectedVehicle.fuelCapacity} L</div>}
            {selectedVehicle.currentFuel && <div><strong>Current Fuel:</strong> {selectedVehicle.currentFuel} L</div>}
            <button onClick={() => setSelectedVehicle(null)} className="mt-6 w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
