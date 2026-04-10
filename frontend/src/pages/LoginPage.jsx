import { useState, useContext } from 'react'
import { authService } from '../services/authService'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await authService.login({
        email: email,
        password,
      })

      // Ensure token is stored before navigation
      const { access_token, refresh_token } = response.data
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      
      // Fetch user data
      try {
        const userData = await authService.getCurrentUser()
        login(userData.data)
      } catch (err) {
        console.error('Failed to fetch user data:', err)
        // Still continue even if fetch fails
        login({ email: email })
      }
      
      // Small delay to ensure localStorage is persisted
      setTimeout(() => {
        navigate('/')
      }, 100)
    } catch (err) {
      console.error('Login error:', err)
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">TGd System</h1>
        <p className="text-gray-600 text-center mb-8">Asset Management Platform</p>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              className="input-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              className="input-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-gray-600 text-sm text-center mt-4">
          Demo credentials: admin / password123
        </p>
      </div>
    </div>
  )
}
