import { useState } from 'react'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('month')

  const stats = {
    uptime: 99.8,
    mttr: 2.3,
    mtbf: 720,
    costSavings: 45000,
    equipmentUtilization: 87,
  }

  const kpiData = [
    { name: 'Asset Uptime', value: '99.8%', trend: '↑ 0.2%', target: '99.5%', status: 'exceeds' },
    { name: 'MTTR (Hours)', value: '2.3', trend: '↓ 0.5h', target: '4h', status: 'exceeds' },
    { name: 'MTBF (Hours)', value: '720', trend: '↑ 48h', target: '600h', status: 'exceeds' },
    { name: 'Maintenance Cost', value: '$125,400', trend: '↓ 8%', target: '$140k', status: 'exceeds' },
    { name: 'Resource Capacity', value: '92%', trend: '↑ 3%', target: '85%', status: 'exceeds' },
    { name: 'Safety Incidents', value: '0', trend: 'No change', target: '0', status: 'on-target' },
  ]

  const assetUtilization = [
    { category: 'Servers', utilization: 89, capacity: 100 },
    { category: 'Storage', utilization: 75, capacity: 100 },
    { category: 'Network', utilization: 62, capacity: 100 },
    { category: 'Workstations', utilization: 94, capacity: 100 },
    { category: 'Vehicles', utilization: 68, capacity: 100 },
  ]

  const costBreakdown = [
    { category: 'Preventive Maintenance', cost: 45000, percentage: 35 },
    { category: 'Corrective Maintenance', cost: 32000, percentage: 25 },
    { category: 'Equipment Purchase', cost: 28000, percentage: 22 },
    { category: 'Spare Parts', cost: 18000, percentage: 14 },
    { category: 'Training', cost: 6000, percentage: 4 },
  ]

  const maintenanceSchedule = [
    { equipment: 'CNC Machine A', nextDue: '2026-04-20', interval: '30 days', status: 'on-schedule' },
    { equipment: 'Hydraulic Press B', nextDue: '2026-04-25', interval: '30 days', status: 'on-schedule' },
    { equipment: 'Database Server', nextDue: '2026-04-15', interval: '90 days', status: 'due-soon' },
    { equipment: 'Core Network Switch', nextDue: '2026-04-10', interval: '90 days', status: 'overdue' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">📊 Reporting & Analytics</h1>
        <p className="text-gray-600 mt-2">KPI dashboards, utilization reports, and cost analysis</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-8 flex gap-4">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="quarter">Last 90 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-lg shadow p-2">
        {['overview', 'utilization', 'costs', 'maintenance', 'performance'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded font-medium transition ${
              activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'text-gray-800 hover:bg-gray-100'
            }`}
          >
            {tab === 'overview' && '📈 Overview'}
            {tab === 'utilization' && '⚙️ Utilization'}
            {tab === 'costs' && '💰 Costs'}
            {tab === 'maintenance' && '🔧 Maintenance'}
            {tab === 'performance' && '⭐ Performance'}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {kpiData.map((kpi, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6 border-t-4 border-primary-600">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">{kpi.name}</h3>
                <p className="text-3xl font-bold text-primary-600">{kpi.value}</p>
                <div className="mt-3 flex justify-between items-center text-xs">
                  <span className="text-green-600">{kpi.trend}</span>
                  <span className="text-gray-600">Target: {kpi.target}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow p-6 border-l-4 border-green-600">
            <h3 className="text-lg font-bold mb-4">Executive Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Annual Cost Savings</p>
                <p className="text-2xl font-bold text-green-700">${stats.costSavings.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Equipment Uptime</p>
                <p className="text-2xl font-bold text-green-700">{stats.uptime}%</p>
              </div>
              <div>
                <p className="text-gray-600">Mean Time to Repair</p>
                <p className="text-2xl font-bold text-green-700">{stats.mttr}h</p>
              </div>
              <div>
                <p className="text-gray-600">Overall Utilization</p>
                <p className="text-2xl font-bold text-green-700">{stats.equipmentUtilization}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UTILIZATION TAB */}
      {activeTab === 'utilization' && (
        <div className="space-y-6">
          {assetUtilization.map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">{item.category}</h3>
                <span className="text-2xl font-bold text-primary-600">{item.utilization}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 to-primary-600 h-full rounded-full transition-all"
                  style={{ width: `${item.utilization}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Capacity: {item.capacity} units | Used: {item.utilization} units</p>
            </div>
          ))}
        </div>
      )}

      {/* COSTS TAB */}
      {activeTab === 'costs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-6">Cost Breakdown</h3>
            <div className="space-y-4">
              {costBreakdown.map((item, idx) => (
                <div key={idx} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{item.category}</h4>
                    <span className="text-2xl font-bold text-primary-600">${item.cost.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-primary-600 h-full rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.percentage}% of total budget</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg shadow p-6 border-l-4 border-blue-600">
            <p className="font-bold text-lg mb-2">Total Budget Spent</p>
            <p className="text-4xl font-bold text-blue-700">$129,000</p>
            <p className="text-sm text-gray-600 mt-2">Out of $150,000 annual budget (86% utilized)</p>
          </div>
        </div>
      )}

      {/* MAINTENANCE TAB */}
      {activeTab === 'maintenance' && (
        <div className="bg-white rounded-lg shadow">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Equipment</th>
                <th className="px-6 py-4 text-left font-semibold">Next Due</th>
                <th className="px-6 py-4 text-left font-semibold">Interval</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceSchedule.map((item, idx) => {
                const statusColors = {
                  'on-schedule': 'bg-green-100 text-green-800',
                  'due-soon': 'bg-yellow-100 text-yellow-800',
                  'overdue': 'bg-red-100 text-red-800',
                }
                return (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{item.equipment}</td>
                    <td className="px-6 py-4">{item.nextDue}</td>
                    <td className="px-6 py-4">{item.interval}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                        {item.status.replace('-', ' ')}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PERFORMANCE TAB */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4">System Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Overall Health</span>
                  <span className="font-bold">95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Asset Compliance</span>
                  <span className="font-bold">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Predictive Maintenance</span>
                  <span className="font-bold">88%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4">Risk Assessment</h3>
            <div className="space-y-3">
              <div className="bg-red-50 p-3 rounded border-l-4 border-red-600">
                <p className="font-semibold text-red-900">High Risk</p>
                <p className="text-sm text-red-700">1 asset with overdue maintenance</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-600">
                <p className="font-semibold text-yellow-900">Medium Risk</p>
                <p className="text-sm text-yellow-700">3 assets due for maintenance soon</p>
              </div>
              <div className="bg-green-50 p-3 rounded border-l-4 border-green-600">
                <p className="font-semibold text-green-900">Low Risk</p>
                <p className="text-sm text-green-700">22 assets running normally</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
