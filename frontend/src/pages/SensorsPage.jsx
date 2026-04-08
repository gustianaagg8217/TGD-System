import { useState, useEffect } from 'react'
import { useSensorStream, useMultiSensorStream } from '../hooks/useSensorStream'
import {
  RealtimeSensorCard,
  SensorAlertBanner,
  ConnectionStatus,
} from '../components/RealtimeSensorCard'

export default function SensorsPage() {
  const [activeAssetId, setActiveAssetId] = useState(null)
  const [displayedAlerts, setDisplayedAlerts] = useState([])
  const [viewMode, setViewMode] = useState('live')

  // Sample assets - in production, fetch from API
  const [assets] = useState([
    {
      id: 'asset-1',
      name: 'CNC Machining Center A',
      type: 'machinery',
      location: 'Factory Floor 1',
      status: 'active',
    },
    {
      id: 'asset-2',
      name: 'Hydraulic Press B',
      type: 'machinery',
      location: 'Factory Floor 2',
      status: 'active',
    },
    {
      id: 'asset-3',
      name: 'Forklift FL-001',
      type: 'vehicle',
      location: 'Warehouse',
      status: 'active',
    },
    {
      id: 'asset-4',
      name: 'Air Compressor System',
      type: 'equipment',
      location: 'Utility Room',
      status: 'active',
    },
  ])

  // Sensor configuration for each asset type
  const sensorConfig = {
    machinery: [
      {
        id: 'vibration-1',
        name: 'Machine Vibration Monitor',
        type: 'vibration',
        thresholds: { low: 0.5, high: 5.0 },
      },
      {
        id: 'temperature-1',
        name: 'Bearing Temperature',
        type: 'temperature',
        thresholds: { low: 20, high: 80 },
      },
    ],
    vehicle: [
      {
        id: 'gps-1',
        name: 'Vehicle GPS Tracker',
        type: 'gps',
        thresholds: {},
      },
      {
        id: 'fuel-1',
        name: 'Fuel Level Sensor',
        type: 'fuel',
        thresholds: { low: 10, high: 100 },
      },
    ],
    equipment: [
      {
        id: 'pressure-1',
        name: 'System Pressure',
        type: 'pressure',
        thresholds: { low: 7, high: 10 },
      },
      {
        id: 'temperature-2',
        name: 'Outlet Temperature',
        type: 'temperature',
        thresholds: { low: 20, high: 80 },
      },
    ],
  }

  // Use WebSocket for real-time sensor data
  const sensorStream = useSensorStream(activeAssetId, {
    onAlert: (alert) => {
      setDisplayedAlerts((prev) => [alert, ...prev.slice(0, 5)])
    },
  })

  // Multi-asset stream
  const multiStream = useMultiSensorStream(assets.map((a) => a.id), {
    onAlert: (alert) => {
      setDisplayedAlerts((prev) => [alert, ...prev.slice(0, 5)])
    },
  })

  // Set first asset as default
  useEffect(() => {
    if (!activeAssetId && assets.length > 0) {
      setActiveAssetId(assets[0].id)
    }
  }, [activeAssetId, assets])

  const currentAsset = assets.find((a) => a.id === activeAssetId)
  const sensors = currentAsset ? sensorConfig[currentAsset.type] || [] : []

  const handleDismissAlert = (alertId) => {
    setDisplayedAlerts((prev) => prev.filter((a) => a.id !== alertId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">📡 Real-time IoT Monitoring</h1>
        <p className="text-gray-600 mt-2">Live sensor data from all connected assets with real-time updates</p>
      </div>

      {/* Connection Status */}
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold mb-2">WebSocket Status</p>
          <ConnectionStatus
            isConnected={sensorStream.isConnected}
            error={sensorStream.connectionError}
          />
        </div>
      </div>

      {/* Alert Notifications */}
      {displayedAlerts.length > 0 && (
        <div className="space-y-3">
          {displayedAlerts.map((alert) => (
            <SensorAlertBanner
              key={alert.id}
              alert={alert}
              onDismiss={() => handleDismissAlert(alert.id)}
            />
          ))}
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex gap-2 bg-white rounded-lg shadow p-2 w-fit">
        {['live', 'history'].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-6 py-2 rounded font-medium transition ${
              viewMode === mode
                ? 'bg-primary-600 text-white'
                : 'text-gray-800 hover:bg-gray-100'
            }`}
          >
            {mode === 'live' ? '🟢 Live' : '📊 History'}
          </button>
        ))}
      </div>

      {/* Asset Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Select Asset to Monitor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => setActiveAssetId(asset.id)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                activeAssetId === asset.id
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-primary-400'
              }`}
            >
              <p className="font-semibold">{asset.name}</p>
              <p className="text-sm text-gray-600 mt-1">📍 {asset.location}</p>
              <p className="text-xs text-gray-500 mt-2">
                {asset.status === 'active' ? '🟢 Active' : '⚫ Offline'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'live' && activeAssetId && (
        <div>
          {/* Asset Info */}
          {currentAsset && (
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold">{currentAsset.name}</h2>
              <p className="mt-2 opacity-90">📍 {currentAsset.location}</p>
              <div className="mt-4 flex gap-6">
                <div>
                  <p className="text-sm opacity-75">Type</p>
                  <p className="font-semibold capitalize">{currentAsset.type}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">Status</p>
                  <p className="font-semibold">
                    {currentAsset.status === 'active' ? '🟢 Active' : '⚫ Offline'}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-75">Connected Sensors</p>
                  <p className="font-semibold">{sensors.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Sensors Grid - Real-time Updates */}
          {sensors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sensors.map((sensor) => (
                <RealtimeSensorCard
                  key={sensor.id}
                  sensor={sensor}
                  data={sensorStream.sensorData}
                  isConnected={sensorStream.isConnected}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-600 text-lg">No sensors configured for this asset</p>
              <p className="text-gray-500 text-sm mt-2">
                Add sensors to this asset to start monitoring
              </p>
            </div>
          )}
        </div>
      )}

      {/* History View */}
      {viewMode === 'history' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Historical Data</h3>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">Historical data visualization coming soon</p>
            <p className="text-gray-500 text-sm mt-2">
              Charts and trends for sensor data over time
            </p>
          </div>
        </div>
      )}

      {/* Live Alerts Feed */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🚨 Live Alert Feed</h3>
        {displayedAlerts.length > 0 ? (
          <div className="space-y-3">
            {displayedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="border-l-4 border-red-500 bg-red-50 p-4 rounded"
              >
                <p className="font-semibold text-red-800">{alert.message || 'Alert'}</p>
                <p className="text-sm text-red-700 mt-1">
                  Severity: <span className="uppercase">{alert.severity}</span>
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No active alerts</p>
        )}
      </div>

      {/* Connection Statistics */}
      {sensorStream.isConnected && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 mb-1">Update Frequency</p>
            <p className="text-2xl font-bold text-primary-600">~3s</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 mb-1">Connection Status</p>
            <p className="text-2xl font-bold text-green-600">Stable</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 mb-1">Data Points/Hour</p>
            <p className="text-2xl font-bold text-blue-600">1,200+</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-gray-600 mb-1">Active Sensors</p>
            <p className="text-2xl font-bold text-purple-600">{sensors.length}</p>
          </div>
        </div>
      )}
    </div>
  )
}

