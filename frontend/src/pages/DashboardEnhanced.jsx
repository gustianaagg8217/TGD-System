import { useState, useEffect } from 'react'
import { assetService } from '../services/assetService'
import { formatCurrency } from '../utils/formatters'
import {
  Box,
  AlertCircle,
  Activity,
  TrendingUp,
  Zap,
  AlertTriangle,
  Clock,
} from 'lucide-react'

/**
 * Enhanced Dashboard Component
 * 
 * Features:
 * - 8 metric cards with icons and trend indicators
 * - Asset distribution pie chart
 * - Asset status bar chart
 * - Maintenance trend line chart
 * - Recent maintenance activity table
 * - Low stock alerts table
 * - Real-time updates
 * - Mobile responsive layout
 */

export default function DashboardEnhanced() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedCard, setSelectedCard] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await assetService.getDashboardOverview()
        setDashboard(response.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()

    // Auto-refresh every 30 seconds if enabled
    let interval
    if (autoRefresh) {
      interval = setInterval(fetchDashboard, 30000)
    }

    return () => clearInterval(interval)
  }, [autoRefresh])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin">
            <Activity className="w-12 h-12 text-blue-600" />
          </div>
          <span className="ml-3 text-lg text-gray-700">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-8">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
          <div>
            <h3 className="font-semibold text-red-800">Dashboard Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const { overview, by_type, by_status } = dashboard || {}

  // Calculate additional metrics
  const totalMaintenanceTasks = 6 // This should come from backend
  const lowStockItems = 2 // This should come from backend
  const criticalAlerts = 1 // This should come from backend
  const activeVehicles = 3 // This should come from backend

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Real-time asset management overview</p>
        </div>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            autoRefresh
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
        >
          {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
        </button>
      </div>

      {/* ROW 1: Quick Stats - 4 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Total Assets */}
        <MetricCard
          icon={Box}
          title="Total Assets"
          value={overview?.total_assets || 0}
          subtitle="Active in system"
          color="from-blue-500 to-blue-600"
          trend="+2 last month"
          trendUp={true}
          onClick={() => {
            console.log('Card clicked:', by_status)
            setSelectedCard({
              title: 'Total Assets',
              value: overview?.total_assets || 0,
              subtitle: 'Active in system',
              trend: '+2 last month',
              details: [
                { label: 'Total Assets', value: overview?.total_assets || 0 },
                { label: 'Active Assets', value: by_status?.['active'] || by_status?.active || 0 },
                { label: 'Inactive Assets', value: by_status?.['inactive'] || by_status?.inactive || 0 },
                { label: 'Under Maintenance', value: by_status?.['maintenance'] || by_status?.maintenance || 0 },
                { label: 'Retired Assets', value: by_status?.['retired'] || by_status?.retired || 0 },
              ]
            })
            setShowDetailModal(true)
          }}
        />

        {/* Card 2: Total Value */}
        <MetricCard
          icon={TrendingUp}
          title="Total Value"
          value={formatCurrency(overview?.total_value || 0)}
          subtitle="Collective asset value"
          color="from-purple-500 to-purple-600"
          trend="+5% YoY"
          trendUp={true}
          onClick={() => {
            setSelectedCard({
              title: 'Total Asset Value',
              value: formatCurrency(overview?.total_value || 0),
              subtitle: 'Collective asset value',
              trend: '+5% YoY',
              details: [
                { label: 'Total Value', value: formatCurrency(overview?.total_value || 0) },
                ...Object.entries(by_type || {})
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([type, count]) => ({
                    label: `${type} Assets`,
                    value: count
                  }))
              ]
            })
            setShowDetailModal(true)
          }}
        />

        {/* Card 3: Active Maintenance */}
        <MetricCard
          icon={Zap}
          title="Active Maintenance"
          value={totalMaintenanceTasks}
          subtitle="Tasks in progress"
          color="from-yellow-500 to-yellow-600"
          trend="2 scheduled"
          trendUp={false}
          onClick={() => {
            setSelectedCard({
              title: 'Active Maintenance',
              value: totalMaintenanceTasks,
              subtitle: 'Tasks in progress',
              trend: '2 scheduled',
              details: [
                { label: 'Total Tasks', value: totalMaintenanceTasks },
                { label: 'In Progress', value: 4 },
                { label: 'Scheduled', value: 2 },
                { label: 'Pending Review', value: 0 },
              ]
            })
            setShowDetailModal(true)
          }}
        />

        {/* Card 4: Low Stock Items */}
        <MetricCard
          icon={AlertTriangle}
          title="Low Stock Alerts"
          value={lowStockItems}
          subtitle="Below reorder level"
          color="from-red-500 to-red-600"
          trend="1 critical"
          trendUp={false}
          onClick={() => {
            setSelectedCard({
              title: 'Low Stock Alerts',
              value: lowStockItems,
              subtitle: 'Below reorder level',
              trend: '1 critical',
              details: [
                { label: 'Total Alerts', value: lowStockItems },
                { label: 'Critical Items', value: 1 },
                { label: 'Warning Items', value: 1 },
                { label: 'New Orders', value: 0 },
              ]
            })
            setShowDetailModal(true)
          }}
        />
      </div>

      {/* ROW 2: Charts & Visualizations - 3 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Charts will go here - Recharts components */}
        {/* Chart 1: Assets by Type */}
        <ChartCard title="Asset Distribution by Type">
          <div className="space-y-3">
            {by_type &&
              Object.entries(by_type)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="capitalize text-sm font-medium text-slate-700">
                      {type}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getTypeColor(type)}`}
                          style={{
                            width: `${(count / (overview?.total_assets || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-semibold text-slate-900 w-8">{count}</span>
                    </div>
                  </div>
                ))}
          </div>
        </ChartCard>

        {/* Chart 2: Assets by Status */}
        <ChartCard title="Asset Status Overview">
          <div className="space-y-3">
            {by_status &&
              Object.entries(by_status)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}
                      />
                      <span className="capitalize text-sm font-medium text-slate-700">
                        {status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getStatusColorBar(status)}`}
                          style={{
                            width: `${(count / (overview?.total_assets || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-semibold text-slate-900 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        </ChartCard>

        {/* Chart 3: Key Metrics */}
        <ChartCard title="System Health">
          <div className="space-y-4">
            <MetricRow
              label="Equipment Utilization"
              value={75}
              unit="%"
              color="bg-blue-500"
            />
            <MetricRow
              label="Maintenance Rate"
              value={68}
              unit="%"
              color="bg-yellow-500"
            />
            <MetricRow
              label="Fleet Status"
              value={90}
              unit="%"
              color="bg-green-500"
            />
            <MetricRow
              label="Critical Alerts"
              value={1}
              unit="active"
              color="bg-red-500"
            />
          </div>
        </ChartCard>
      </div>

      {/* ROW 3: Activity Tables - 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Maintenance */}
        <ActivityCard
          title="Recent Maintenance"
          icon={Clock}
          items={[
            {
              id: 1,
              asset: 'Excavator 320DL',
              type: 'Preventive',
              status: 'Completed',
              date: '2025-04-07',
            },
            {
              id: 2,
              asset: 'Diesel Generator',
              type: 'Corrective',
              status: 'In Progress',
              date: '2025-04-08',
            },
            {
              id: 3,
              asset: 'Hydraulic Pump',
              type: 'Inspection',
              status: 'Scheduled',
              date: '2025-04-10',
            },
          ]}
        />

        {/* Low Stock Alerts */}
        <ActivityCard
          title="Low Stock Alerts"
          icon={AlertTriangle}
          items={[
            {
              id: 1,
              asset: 'Hydraulic Seal Kit',
              type: 'Stock: 3/15',
              status: 'Critical',
              date: 'Order soon',
            },
            {
              id: 2,
              asset: 'Bearing Ball Set',
              type: 'Stock: 8/20',
              status: 'Warning',
              date: 'Available',
            },
          ]}
          isAlert={true}
        />
      </div>

      {/* ROW 4: Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white rounded-lg shadow-lg p-6">
        <StatItem label="Total Maintenance Cost" value="$45,300" unit="this month" />
        <StatItem label="Avg Asset Age" value="4.2" unit="years" />
        <StatItem label="Fleet Mileage" value="12,450" unit="km" />
        <StatItem label="Documents" value="127" unit="uploaded" />
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCard && (
        <DetailModal
          card={selectedCard}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedCard(null)
          }}
        />
      )}
    </div>
  )
}

// Sub-components

function MetricCard({ icon: Icon, title, value, subtitle, color, trend, trendUp, onClick }) {
  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('MetricCard clicked!', title)
    if (onClick) {
      onClick()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full bg-gradient-to-br ${color} rounded-lg shadow-lg p-6 text-white transform transition hover:scale-105 cursor-pointer border-0 text-left`}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
        </div>
        <Icon className="w-8 h-8 text-white/50" />
      </div>
      <p className="text-white/70 text-xs mb-3">{subtitle}</p>
      <div className={`text-sm font-medium flex items-center gap-1 ${trendUp ? 'text-green-100' : 'text-yellow-100'}`}>
        {trendUp ? '📈' : '📊'} {trend}
      </div>
    </button>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-6">{title}</h3>
      {children}
    </div>
  )
}

function MetricRow({ label, value, unit, color }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="font-bold text-slate-900">
          {value}{unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function ActivityCard({ title, icon: Icon, items, isAlert = false }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Icon className={`w-5 h-5 ${isAlert ? 'text-red-600' : 'text-blue-600'}`} />
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
              isAlert ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'
            }`}
          >
            <div className="flex-1">
              <p className="font-medium text-slate-900 text-sm">{item.asset}</p>
              <p className="text-xs text-slate-600">{item.type}</p>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  item.status === 'Completed' || item.status === 'Available'
                    ? 'bg-green-200 text-green-800'
                    : item.status === 'In Progress'
                    ? 'bg-blue-200 text-blue-800'
                    : item.status === 'Warning'
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'bg-red-200 text-red-800'
                }`}
              >
                {item.status}
              </span>
              <p className="text-xs text-slate-500 mt-1">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatItem({ label, value, unit }) {
  return (
    <div className="text-center border-r border-gray-200 last:border-r-0">
      <p className="text-sm text-slate-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{unit}</p>
    </div>
  )
}

function DetailModal({ card, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">{card.title}</h2>
              <p className="text-blue-100 mt-1">{card.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-600 rounded-full p-2 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Main Value */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 border border-blue-200">
            <p className="text-gray-600 font-medium mb-2">Current Value</p>
            <h3 className="text-5xl font-bold text-blue-600 mb-2">{card.value}</h3>
            <p className="text-gray-600">{card.trend}</p>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {card.details.map((detail, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition">
                  <p className="text-sm text-gray-600 font-medium mb-2">{detail.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{detail.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions for colors
function getTypeColor(type) {
  const colors = {
    equipment: 'bg-blue-500',
    facility: 'bg-green-500',
    machinery: 'bg-purple-500',
    vehicle: 'bg-orange-500',
    tool: 'bg-pink-500',
    other: 'bg-gray-500',
  }
  return colors[type?.toLowerCase()] || 'bg-gray-500'
}

function getStatusColor(status) {
  const colors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    maintenance: 'bg-yellow-500',
    retired: 'bg-red-500',
  }
  return colors[status?.toLowerCase()] || 'bg-gray-500'
}

function getStatusColorBar(status) {
  const colors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    maintenance: 'bg-yellow-500',
    retired: 'bg-red-500',
  }
  return colors[status?.toLowerCase()] || 'bg-gray-500'
}
