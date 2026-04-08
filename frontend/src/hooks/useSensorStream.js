/**
 * useSensorStream Hook
 * 
 * Real-time WebSocket connection for sensor data streaming.
 * Manages connection lifecycle, subscription, and data updates.
 */

import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Hook for real-time sensor data streaming
 * 
 * @param {string} assetId - Asset ID to subscribe to
 * @param {object} options - Configuration options
 * @param {string} options.wsUrl - WebSocket URL (default: auto-detect)
 * @param {boolean} options.autoConnect - Auto-connect on mount (default: true)
 * @param {function} options.onData - Callback when sensor data received
 * @param {function} options.onAlert - Callback when alert received
 * @param {function} options.onError - Callback when error occurs
 * 
 * @returns {object} Connection state and methods
 */
export function useSensorStream(assetId, options = {}) {
  const {
    wsUrl = null,
    autoConnect = true,
    onData = null,
    onAlert = null,
    onError = null,
  } = options

  const ws = useRef(null)
  const reconnectTimeout = useRef(null)
  const pingInterval = useRef(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const [status, setStatus] = useState('disconnected') // disconnected, connecting, connected, error
  const [sensorData, setSensorData] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [stats, setStats] = useState({})
  const [connectionError, setConnectionError] = useState(null)

  // Determine WebSocket URL
  const getWsUrl = useCallback(() => {
    if (wsUrl) return wsUrl

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    return `${protocol}//${host}/ws/sensors/${assetId}`
  }, [assetId, wsUrl])

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (ws.current) return

    try {
      setStatus('connecting')
      const url = getWsUrl()
      console.log(`📡 Connecting to WebSocket: ${url}`)

      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected')
        setStatus('connected')
        setConnectionError(null)
        reconnectAttempts.current = 0

        // Start keep-alive ping every 30 seconds
        pingInterval.current = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'ping' }))
          }
        }, 30000)
      }

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)

          switch (message.type) {
            case 'subscription':
              console.log(`✅ Subscribed to asset: ${message.asset_name}`)
              break

            case 'sensor_data':
              setSensorData(message.data)
              if (onData) onData(message.data)
              break

            case 'sensor_alert':
              const newAlert = {
                ...message.data,
                id: `${Date.now()}-${Math.random()}`,
                timestamp: message.timestamp,
              }
              setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]) // Keep last 10
              if (onAlert) onAlert(newAlert)
              break

            case 'stats':
              setStats(message.data)
              break

            case 'pong':
              // Keep-alive response
              break

            case 'error':
              console.error('WebSocket error:', message.message)
              setConnectionError(message.message)
              break

            default:
              console.warn('Unknown message type:', message.type)
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e)
        }
      }

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setStatus('error')
        setConnectionError('Connection error')
        if (onError) onError(error)
      }

      ws.current.onclose = () => {
        console.log('WebSocket disconnected')
        ws.current = null
        clearInterval(pingInterval.current)

        if (status !== 'disconnected') {
          // Attempt reconnection
          if (reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000)
            console.log(`🔄 Reconnecting in ${delay}ms... (Attempt ${reconnectAttempts.current + 1})`)
            reconnectAttempts.current++

            reconnectTimeout.current = setTimeout(() => {
              connect()
            }, delay)
          } else {
            setStatus('error')
            setConnectionError('Max reconnection attempts exceeded')
          }
        }
      }
    } catch (e) {
      console.error('Error connecting to WebSocket:', e)
      setStatus('error')
      setConnectionError(e.message)
    }
  }, [getWsUrl, status, onData, onAlert, onError])

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting from WebSocket')
    clearInterval(pingInterval.current)
    clearTimeout(reconnectTimeout.current)

    if (ws.current) {
      ws.current.close()
      ws.current = null
    }

    setStatus('disconnected')
    setSensorData(null)
    setAlerts([])
  }, [])

  // Subscribe to different asset
  const subscribe = useCallback((newAssetId) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'subscribe',
          asset_id: newAssetId,
        })
      )
    }
  }, [])

  // Unsubscribe from current asset
  const unsubscribe = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'unsubscribe' }))
    }
  }, [])

  // Request connection statistics
  const getStats = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'get_stats' }))
    }
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && assetId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [assetId, autoConnect, connect, disconnect])

  return {
    // State
    status,
    sensorData,
    alerts,
    stats,
    connectionError,

    // Methods
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    getStats,

    // Helpers
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    hasError: status === 'error',
  }
}

/**
 * Hook for multi-asset sensor monitoring
 * 
 * @param {array} assetIds - Array of asset IDs to monitor
 * @param {object} options - Configuration options
 * 
 * @returns {object} Connection state and methods
 */
export function useMultiSensorStream(assetIds = [], options = {}) {
  const {
    wsUrl = null,
    autoConnect = true,
    onData = null,
    onAlert = null,
    onError = null,
  } = options

  const ws = useRef(null)
  const pingInterval = useRef(null)
  const reconnectTimeout = useRef(null)

  const [status, setStatus] = useState('disconnected')
  const [sensorDataMap, setSensorDataMap] = useState({}) // asset_id -> sensor_data
  const [alerts, setAlerts] = useState([])
  const [connectionError, setConnectionError] = useState(null)
  const [subscribedAssets, setSubscribedAssets] = useState([])

  const getWsUrl = useCallback(() => {
    if (wsUrl) return wsUrl
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    return `${protocol}//${host}/ws/sensors/multi`
  }, [wsUrl])

  const connect = useCallback(() => {
    if (ws.current) return

    try {
      setStatus('connecting')
      const url = getWsUrl()
      console.log(`📡 Connecting to multi-asset WebSocket: ${url}`)

      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log('✅ Multi-asset WebSocket connected')
        setStatus('connected')
        setConnectionError(null)

        // Subscribe to initial assets
        if (assetIds.length > 0) {
          ws.current.send(
            JSON.stringify({
              type: 'subscribe',
              asset_ids: assetIds,
            })
          )
        }

        // Keep-alive
        pingInterval.current = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'ping' }))
          }
        }, 30000)
      }

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)

          switch (message.type) {
            case 'subscription':
              setSubscribedAssets(message.asset_ids || [])
              break

            case 'sensor_data':
              setSensorDataMap((prev) => ({
                ...prev,
                [message.asset_id]: message.data,
              }))
              if (onData) onData(message.asset_id, message.data)
              break

            case 'sensor_alert':
              const alert = {
                ...message.data,
                id: `${Date.now()}-${Math.random()}`,
                asset_id: message.asset_id,
              }
              setAlerts((prev) => [alert, ...prev.slice(0, 9)])
              if (onAlert) onAlert(alert)
              break

            case 'pong':
              break
          }
        } catch (e) {
          console.error('Error parsing message:', e)
        }
      }

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setStatus('error')
        if (onError) onError(error)
      }

      ws.current.onclose = () => {
        console.log('Multi-asset WebSocket disconnected')
        ws.current = null
        clearInterval(pingInterval.current)
      }
    } catch (e) {
      console.error('Error connecting:', e)
      setStatus('error')
      setConnectionError(e.message)
    }
  }, [getWsUrl, assetIds, onData, onAlert, onError])

  const disconnect = useCallback(() => {
    clearInterval(pingInterval.current)
    if (ws.current) {
      ws.current.close()
      ws.current = null
    }
    setStatus('disconnected')
  }, [])

  const subscribeToAssets = useCallback((ids) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'subscribe',
          asset_ids: ids,
        })
      )
    }
  }, [])

  const unsubscribeFromAsset = useCallback((assetId) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: 'unsubscribe',
          asset_id: assetId,
        })
      )
    }
  }, [])

  useEffect(() => {
    if (autoConnect && assetIds.length > 0) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect, assetIds.length])

  return {
    status,
    sensorDataMap,
    alerts,
    subscribedAssets,
    connectionError,

    connect,
    disconnect,
    subscribeToAssets,
    unsubscribeFromAsset,

    isConnected: status === 'connected',
    hasError: status === 'error',
  }
}
