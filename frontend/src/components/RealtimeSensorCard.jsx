/**
 * Real-time Sensor Card Component
 * 
 * Displays real-time sensor data with live updates, alerts, and historical trends.
 */

import { useState, useEffect } from 'react'

export function RealtimeSensorCard({ sensor, data, isConnected }) {
  const [trend, setTrend] = useState('stable')
  const [prevValue, setPrevValue] = useState(null)
  const [history, setHistory] = useState([])

  // Calculate trend based on history
  useEffect(() => {
    if (data) {
      setHistory((prev) => [...prev.slice(-19), data.reading_value])

      if (prevValue !== null) {
        if (data.reading_value > prevValue * 1.02) setTrend('up')
        else if (data.reading_value < prevValue * 0.98) setTrend('down')
        else setTrend('stable')
      }

      setPrevValue(data.reading_value)
    }
  }, [data])

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-300">
        <h3 className="font-semibold text-gray-700 mb-2">{sensor.name}</h3>
        <p className="text-gray-500 text-sm">Waiting for data...</p>
      </div>
    )
  }

  const isAlert =
    (data.threshold_high && data.reading_value > data.threshold_high) ||
    (data.threshold_low && data.reading_value < data.threshold_low)

  const getStatusColor = () => {
    if (!isConnected) return 'border-gray-300 bg-gray-50'
    if (isAlert) return 'border-red-500 bg-red-50'
    return 'border-green-500 bg-green-50'
  }

  const getValueColor = () => {
    if (!isConnected) return 'text-gray-600'
    if (isAlert) return 'text-red-600'
    return 'text-green-600'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return '📈'
    if (trend === 'down') return '📉'
    return '➡️'
  }

  const sensorTypeEmoji = {
    temperature: '🌡️',
    vibration: '📊',
    fuel: '⛽',
    gps: '📍',
    electrical: '⚡',
    production: '🏭',
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 border-t-4 transition ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">
            {sensorTypeEmoji[data.sensor_type] || '📡'} {sensor.name}
          </h3>
          <p className="text-gray-600 text-sm">{data.sensor_id}</p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-green-600 font-semibold">LIVE</span>
            </>
          ) : (
            <>
              <span className="w-3 h-3 rounded-full bg-gray-400"></span>
              <span className="text-xs text-gray-600 font-semibold">OFFLINE</span>
            </>
          )}
        </div>
      </div>

      {/* Value Display */}
      <div className="mb-6">
        <div className={`text-4xl font-bold ${getValueColor()}`}>
          {data.reading_value?.toFixed(2)} <span className="text-xl">{data.reading_unit}</span>
        </div>

        {/* Trend */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-2xl">{getTrendIcon()}</span>
          <span className="text-sm text-gray-600">{trend} trend</span>
        </div>
      </div>

      {/* Threshold Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {data.threshold_high && (
          <div>
            <p className="text-xs text-gray-600">High Threshold</p>
            <p className="font-semibold text-red-600">{data.threshold_high}</p>
          </div>
        )}
        {data.threshold_low && (
          <div>
            <p className="text-xs text-gray-600">Low Threshold</p>
            <p className="font-semibold text-blue-600">{data.threshold_low}</p>
          </div>
        )}
      </div>

      {/* Mini Chart - History */}
      {history.length > 1 && (
        <div className="mb-6">
          <p className="text-xs text-gray-600 mb-2">Last 20 readings</p>
          <div className="flex items-end justify-between h-12 gap-0.5 bg-gray-100 rounded px-2 py-2">
            {history.map((value, i) => {
              const min = Math.min(...history)
              const max = Math.max(...history)
              const range = max - min || 1
              const height = ((value - min) / range) * 100

              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t ${isAlert ? 'bg-red-400' : 'bg-blue-400'}`}
                  style={{ height: `${height}%`, minHeight: '2px' }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Alert Badge */}
      {isAlert && (
        <div className="bg-red-100 border border-red-300 rounded px-3 py-2">
          <p className="text-red-800 text-sm font-semibold">⚠️ Threshold Exceeded</p>
          <p className="text-red-700 text-xs mt-1">
            {data.reading_value > data.threshold_high
              ? `Above high threshold (${data.threshold_high})`
              : `Below low threshold (${data.threshold_low})`}
          </p>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-gray-500 mt-4">
        Updated: {new Date().toLocaleTimeString()}
      </p>
    </div>
  )
}

export function SensorAlertBanner({ alert, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 10000) // Auto-dismiss after 10s
    return () => clearTimeout(timer)
  }, [onDismiss])

  const severityColor = {
    critical: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  }

  return (
    <div
      className={`${severityColor[alert.severity] || 'bg-red-500'} text-white px-6 py-4 rounded-lg shadow-lg animate-pulse`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-1">🚨 Sensor Alert</h4>
          <p className="text-sm">{alert.message || alert.data?.message}</p>
          {alert.reading_value && (
            <p className="text-xs mt-2 opacity-90">
              Current: {alert.reading_value} | Threshold: {alert.threshold_value}
            </p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-white hover:bg-black hover:bg-opacity-20 px-3 py-1 rounded"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export function ConnectionStatus({ isConnected, error }) {
  if (isConnected) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
        <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
        Connected to sensor stream
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
      <span className="w-2 h-2 rounded-full bg-red-600"></span>
      {error || 'Offline - Attempting to reconnect...'}
    </div>
  )
}
