import { useState, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { LanguageContext } from '../../context/LanguageContext'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)
  const { language, changeLanguage, t } = useContext(LanguageContext)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const displayName = user?.full_name || user?.username || 'User'

  const navItems = [
    { path: '/', labelKey: 'nav.dashboard' },
    { path: '/assets', labelKey: 'nav.assets' },
    { path: '/maintenance', labelKey: 'nav.maintenance' },
    { path: '/inventory', labelKey: 'nav.inventory' },
    { path: '/fleet', labelKey: 'nav.fleet' },
    { path: '/documents', labelKey: 'nav.documents' },
    { path: '/gis', labelKey: 'nav.gis' },
    { path: '/it-assets', labelKey: 'nav.itAssets' },
    { path: '/sensors', labelKey: 'nav.sensors' },
    { path: '/reports', labelKey: 'nav.reports' },
  ]

  const settingsItems = [
    { path: '/users', labelKey: 'nav.users' },
    { path: '/settings', labelKey: 'nav.settings' },
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
                {t(item.labelKey)}
              </Link>
            ))}

            {/* Language Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded text-white hover:bg-primary-500 transition ml-2"
                title="Change Language"
              >
                <span className="text-xl">🌐</span>
                <span className="text-sm">{language.toUpperCase()}</span>
              </button>
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                  <button
                    onClick={() => {
                      changeLanguage('en')
                      setIsLanguageOpen(false)
                    }}
                    className={`block w-full text-left px-4 py-3 font-medium transition ${
                      language === 'en' ? 'bg-blue-50 text-primary-600' : 'text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    🇺🇸 {t('language.english')}
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage('id')
                      setIsLanguageOpen(false)
                    }}
                    className={`block w-full text-left px-4 py-3 font-medium transition border-t ${
                      language === 'id' ? 'bg-blue-50 text-primary-600' : 'text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    🇮🇩 {t('language.indonesian')}
                  </button>
                </div>
              )}
            </div>

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
                      {t(item.labelKey)}
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
                <span>{displayName}</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition border-t"
                  >
                    🚪 {t('nav.logout')}
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
                {t(item.labelKey)}
              </Link>
            ))}
            
            {/* Language Section Mobile */}
            <div className="border-t border-primary-500 mt-2 pt-2">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="w-full text-left px-4 py-2 text-white hover:bg-primary-500 rounded font-medium"
              >
                🌐 {t('language.select')}
              </button>
              {isLanguageOpen && (
                <div className="ml-4">
                  <button
                    onClick={() => {
                      changeLanguage('en')
                      setIsLanguageOpen(false)
                      setIsMenuOpen(false)
                    }}
                    className={`block w-full text-left px-4 py-2 rounded font-medium transition ${
                      language === 'en' ? 'bg-primary-500' : 'text-white hover:bg-primary-500'
                    }`}
                  >
                    🇺🇸 {t('language.english')}
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage('id')
                      setIsLanguageOpen(false)
                      setIsMenuOpen(false)
                    }}
                    className={`block w-full text-left px-4 py-2 rounded font-medium transition ${
                      language === 'id' ? 'bg-primary-500' : 'text-white hover:bg-primary-500'
                    }`}
                  >
                    🇮🇩 {t('language.indonesian')}
                  </button>
                </div>
              )}
            </div>
            
            {/* Settings Section */}
            <div className="border-t border-primary-500 mt-2 pt-2">
              <p className="text-white text-sm font-semibold px-4 py-2">{t('nav.settings')}</p>
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
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-white hover:bg-primary-500 font-medium transition mt-2 border-t border-primary-500"
            >
              🚪 {t('nav.logout')}
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
