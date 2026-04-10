import React, { createContext, useState, useCallback, useEffect } from 'react'
import { authService } from '../services/authService'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const login = useCallback((userData) => {
    setUser(userData)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }, [])

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const userData = await authService.getCurrentUser()
          login(userData.data)
        } catch (err) {
          console.error('Failed to fetch user:', err)
          logout()
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

