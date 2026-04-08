import { useState, useEffect } from 'react'
import { assetService } from '../services/assetService'
import { formatCurrency } from '../utils/formatters'

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
  }, [])

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (error) return <div className="text-red-600 py-8">Error: {error}</div>

  const { overview, by_type, by_status } = dashboard || {}

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Assets</h3>
          <p className="text-4xl font-bold text-primary-600">{overview?.total_assets || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Value</h3>
          <p className="text-3xl font-bold text-primary-600">
            {formatCurrency(overview?.total_value || 0)}
          </p>
        </div>
      </div>

      {/* Asset Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* By Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Assets by Type</h2>
          <div className="space-y-2">
            {by_type &&
              Object.entries(by_type).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="capitalize">{type}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* By Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Assets by Status</h2>
          <div className="space-y-2">
            {by_status &&
              Object.entries(by_status).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="capitalize">{status}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
