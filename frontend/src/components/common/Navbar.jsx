import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/assets', label: 'Assets' },
    { path: '/maintenance', label: 'Maintenance' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/fleet', label: 'Fleet' },
    { path: '/documents', label: 'Documents' },
    { path: '/gis', label: 'GIS' },
    { path: '/it-assets', label: 'IT Assets' },
    { path: '/sensors', label: 'Sensors' },
    { path: '/reports', label: 'Reports' },
  ]

  const settingsItems = [
    { path: '/users', label: '👥 Users & Access' },
    { path: '/settings', label: '⚙️ Settings' },
  ]

  return (
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-white">
            TGd System
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-1 items-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded font-medium transition ${
                  location.pathname === item.path
                    ? 'bg-white text-primary-600'
                    : 'text-white hover:bg-primary-500'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Settings Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded text-white hover:bg-primary-500 transition ml-2"
              >
                <span className="text-xl">⚙️</span>
              </button>
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50">
                  {settingsItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSettingsOpen(false)}
                      className={`block w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 font-medium transition ${
                        location.pathname === item.path ? 'bg-gray-50' : ''
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded text-white hover:bg-primary-500 transition"
              >
                <span className="text-xl">👤</span>
                <span>Admin</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition border-t"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2 rounded font-medium transition ${
                  location.pathname === item.path
                    ? 'bg-white text-primary-600'
                    : 'text-white hover:bg-primary-500'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Settings Section */}
            <div className="border-t border-primary-500 mt-2 pt-2">
              <p className="text-white text-sm font-semibold px-4 py-2">Settings</p>
              {settingsItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2 rounded font-medium transition ${
                    location.pathname === item.path
                      ? 'bg-white text-primary-600'
                      : 'text-white hover:bg-primary-500'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-white hover:bg-primary-500 font-medium transition mt-2 border-t border-primary-500"
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
