import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import AssetsPage from './pages/AssetsPage'
import MaintenancePage from './pages/MaintenancePage'
import InventoryPage from './pages/InventoryPage'
import FleetPage from './pages/FleetPage'
import DocumentsPage from './pages/DocumentsPage'
import GISPage from './pages/GISPage'
import ITAssetsPage from './pages/ITAssetsPage'
import SensorsPage from './pages/SensorsPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import UsersPage from './pages/UsersPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/fleet" element={<FleetPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/gis" element={<GISPage />} />
        <Route path="/it-assets" element={<ITAssetsPage />} />
        <Route path="/sensors" element={<SensorsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
