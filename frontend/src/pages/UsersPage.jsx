import { useState } from 'react'
import EditRoleModal from '../components/EditRoleModal'
import roleService from '../services/roleService'

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState('users')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editFormData, setEditFormData] = useState(null)
  const [editSubMode, setEditSubMode] = useState('info') // 'info' or 'password'
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [selectedRole, setSelectedRole] = useState(null)
  const [showEditRoleModal, setShowEditRoleModal] = useState(false)
  const currentUserRole = 'Admin' // TODO: Get from auth context

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Rudi Hartono',
      email: 'rudi.hartono@company.com',
      role: 'Admin',
      department: 'IT Operations',
      status: 'active',
      lastLogin: '2026-03-20 14:32',
      joinDate: '2023-06-15',
      permissions: ['view-all', 'edit-all', 'approve', 'delete-assets', 'manage-users'],
    },
    {
      id: 2,
      name: 'Siti Nurhaliza',
      email: 'siti.nurhaliza@company.com',
      role: 'Engineer',
      department: 'Maintenance',
      status: 'active',
      lastLogin: '2026-03-21 09:15',
      joinDate: '2024-01-10',
      permissions: ['view-maintenance', 'edit-maintenance', 'create-workorder'],
    },
    {
      id: 3,
      name: 'Budi Santoso',
      email: 'budi.santoso@company.com',
      role: 'Engineer',
      department: 'Assets',
      status: 'active',
      lastLogin: '2026-03-21 11:42',
      joinDate: '2024-02-20',
      permissions: ['view-assets', 'edit-assets', 'create-asset'],
    },
    {
      id: 4,
      name: 'Diana Putri',
      email: 'diana.putri@company.com',
      role: 'Auditor',
      department: 'Compliance',
      status: 'active',
      lastLogin: '2026-03-20 16:20',
      joinDate: '2023-11-05',
      permissions: ['view-all', 'view-audit', 'export-reports'],
    },
    {
      id: 5,
      name: 'Ahmad Wijaya',
      email: 'ahmad.wijaya@company.com',
      role: 'Operator',
      department: 'Operations',
      status: 'active',
      lastLogin: '2026-03-21 08:00',
      joinDate: '2024-03-01',
      permissions: ['view-fleet', 'view-sensors', 'create-report'],
    },
    {
      id: 6,
      name: 'Lisa Handoko',
      email: 'lisa.handoko@company.com',
      role: 'Viewer',
      department: 'Finance',
      status: 'active',
      lastLogin: '2026-03-19 13:45',
      joinDate: '2024-05-10',
      permissions: ['view-reports', 'view-costanalysis'],
    },
    {
      id: 7,
      name: 'Eka Putra',
      email: 'eka.putra@company.com',
      role: 'Engineer',
      department: 'IT Operations',
      status: 'inactive',
      lastLogin: '2026-02-15 10:30',
      joinDate: '2023-08-20',
      permissions: ['view-it-assets', 'edit-it-assets'],
    },
  ])

  const [auditLogs, setAuditLogs] = useState([
    { id: 1, user: 'Rudi Hartono', action: 'Approve Asset', timestamp: '2026-03-21 14:32', details: 'Approved purchase of Server Unit #5' },
    { id: 2, user: 'Siti Nurhaliza', action: 'Create Work Order', timestamp: '2026-03-21 13:15', details: 'Created maintenance WO for CNC Machine A' },
    { id: 3, user: 'Budi Santoso', action: 'Edit Asset', timestamp: '2026-03-21 11:42', details: 'Updated maintenance cost for Storage Unit' },
    { id: 4, user: 'Diana Putri', action: 'Export Report', timestamp: '2026-03-21 10:20', details: 'Exported quarterly compliance report' },
    { id: 5, user: 'Ahmad Wijaya', action: 'View Sensor Data', timestamp: '2026-03-21 09:05', details: 'Accessed temperature logs for Warehouse' },
    { id: 6, user: 'Rudi Hartono', action: 'Login', timestamp: '2026-03-21 08:00', details: 'Successfully authenticated via LDAP' },
    { id: 7, user: 'Lisa Handoko', action: 'Generate Report', timestamp: '2026-03-20 16:45', details: 'Generated cost analysis for March' },
    { id: 8, user: 'Eka Putra', action: 'Logout', timestamp: '2026-02-15 17:30', details: 'User inactivity timeout' },
  ])

  const roles = [
    { name: 'Admin', description: 'Full system access', color: 'bg-red-100 text-red-800' },
    { name: 'Engineer', description: 'View and edit assets/maintenance', color: 'bg-blue-100 text-blue-800' },
    { name: 'Auditor', description: 'View all, audit logs, exports', color: 'bg-purple-100 text-purple-800' },
    { name: 'Operator', description: 'View and create records', color: 'bg-green-100 text-green-800' },
    { name: 'Viewer', description: 'Read-only access', color: 'bg-gray-100 text-gray-800' },
  ]

  const permissions = [
    'view-all',
    'edit-all',
    'delete-assets',
    'create-asset',
    'edit-maintenance',
    'approve',
    'manage-users',
    'export-reports',
    'view-audit',
    'edit-roles',
  ]

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    roles: roles.length,
    auditEntries: auditLogs.length,
  }

  const handleEditClick = () => {
    setIsEditMode(true)
    setEditSubMode('info')
    setEditFormData({
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedUser.role,
      department: selectedUser.department,
      status: selectedUser.status,
    })
  }

  const handleSaveEdit = () => {
    // Update user in list
    const updatedUsers = users.map(u => 
      u.id === selectedUser.id 
        ? { ...u, ...editFormData }
        : u
    )
    setUsers(updatedUsers)
    
    // Update selected user and exit edit mode
    setSelectedUser({ ...selectedUser, ...editFormData })
    setIsEditMode(false)
    setEditSubMode('info')
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditSubMode('info')
    setEditFormData(null)
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordError('')
  }

  const handleSavePassword = () => {
    // Validation
    setPasswordError('')
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Semua field password harus diisi')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Password baru dan konfirmasi tidak cocok')
      return
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password minimal 6 karakter')
      return
    }

    // Update password (in real app, this would call API)
    console.log('Password changed for user:', selectedUser.email)
    alert('Password berhasil diubah!')
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    setEditSubMode('info')
  }

  const isAdmin = currentUserRole === 'Admin'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">👥 Users & Role Management</h1>
        <p className="text-gray-600 mt-2">Multi-level access control, audit trail, and SSO integration</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-primary-600">
          <h3 className="text-gray-600 text-sm font-semibold">Total Users</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-600">
          <h3 className="text-gray-600 text-sm font-semibold">Active Users</h3>
          <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-600">
          <h3 className="text-gray-600 text-sm font-semibold">Roles</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.roles}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-600">
          <h3 className="text-gray-600 text-sm font-semibold">Audit Entries</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.auditEntries}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-lg shadow p-2">
        {['users', 'roles', 'permissions', 'audit'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded font-medium transition ${
              activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'text-gray-800 hover:bg-gray-100'
            }`}
          >
            {tab === 'users' && '🧑 Users'}
            {tab === 'roles' && '🔐 Roles'}
            {tab === 'permissions' && '🔑 Permissions'}
            {tab === 'audit' && '📋 Audit Trail'}
          </button>
        ))}
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 font-medium"
            >
              ➕ Add User
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-600">
              <h3 className="text-lg font-bold mb-4">Add New User</h3>
              <form className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <input type="text" placeholder="Full Name" className="w-full border rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input type="email" placeholder="email@company.com" className="w-full border rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Role</label>
                  <select className="w-full border rounded-lg px-4 py-2">
                    <option>Select Role</option>
                    {roles.map(r => <option key={r.name}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Department</label>
                  <input type="text" placeholder="Department" className="w-full border rounded-lg px-4 py-2" />
                </div>
                <button type="button" className="col-span-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                  Save User
                </button>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-semibold">Role</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Last Login</th>
                  <th className="px-6 py-4 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${roles.find(r => r.name === user.role)?.color || ''}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.lastLogin}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-primary-600 hover:text-primary-800 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
                {!isEditMode ? (
                  <>
                    <h2 className="text-2xl font-bold mb-4">{selectedUser.name}</h2>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-gray-600 text-sm">Email</p>
                        <p className="font-semibold">{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Role</p>
                        <p className="font-semibold">{selectedUser.role}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Department</p>
                        <p className="font-semibold">{selectedUser.department}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Status</p>
                        <p className="font-semibold">{selectedUser.status}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Join Date</p>
                        <p className="font-semibold">{selectedUser.joinDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Last Login</p>
                        <p className="font-semibold">{selectedUser.lastLogin}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Permissions</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.permissions.map(perm => (
                          <span key={perm} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-xs">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      {isAdmin && (
                        <button
                          onClick={handleEditClick}
                          className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium"
                        >
                          ✏️ Edit User
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedUser(null)}
                        className={`${isAdmin ? 'flex-1' : 'w-full'} bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700`}
                      >
                        Close
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-6">Edit User: {selectedUser.name}</h2>
                    
                    {/* Edit Mode Tabs */}
                    <div className="flex gap-2 mb-6 border-b">
                      <button
                        onClick={() => setEditSubMode('info')}
                        className={`px-4 py-2 font-medium border-b-2 transition ${
                          editSubMode === 'info'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        📝 Edit Info
                      </button>
                      <button
                        onClick={() => setEditSubMode('password')}
                        className={`px-4 py-2 font-medium border-b-2 transition ${
                          editSubMode === 'password'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        🔐 Ubah Password
                      </button>
                    </div>

                    {/* Edit Info Form */}
                    {editSubMode === 'info' && (
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Full Name</label>
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Email</label>
                          <input
                            type="email"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Role</label>
                          <select
                            value={editFormData.role}
                            onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2"
                          >
                            {roles.map(r => <option key={r.name}>{r.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Department</label>
                          <input
                            type="text"
                            value={editFormData.department}
                            onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Status</label>
                          <select
                            value={editFormData.status}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                            className="w-full border rounded-lg px-4 py-2"
                          >
                            <option>active</option>
                            <option>inactive</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Change Password Form */}
                    {editSubMode === 'password' && (
                      <div className="space-y-4 mb-6">
                        {passwordError && (
                          <div className="bg-red-100 text-red-800 px-4 py-3 rounded-lg text-sm">
                            ❌ {passwordError}
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-semibold mb-2">Password Lama</label>
                          <input
                            type="password"
                            value={passwordData.oldPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                            placeholder="Masukkan password lama"
                            className="w-full border rounded-lg px-4 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Password Baru</label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="Masukkan password baru (minimal 6 karakter)"
                            className="w-full border rounded-lg px-4 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Konfirmasi Password</label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder="Ulangi password baru"
                            className="w-full border rounded-lg px-4 py-2"
                          />
                        </div>
                        <p className="text-gray-600 text-sm">💡 Password harus minimal 6 karakter dan cocok dengan konfirmasi</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {editSubMode === 'info' ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                          >
                            ✓ Simpan Perubahan
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium"
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleSavePassword}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                          >
                            ✓ Ubah Password
                          </button>
                          <button
                            onClick={() => {
                              setEditSubMode('info')
                              setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
                              setPasswordError('')
                            }}
                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium"
                          >
                            Kembali
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROLES TAB */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map(role => (
            <div key={role.name} className="bg-white rounded-lg shadow p-6 border-t-4 border-primary-600">
              <h3 className="text-lg font-bold mb-2">{role.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{role.description}</p>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">USERS IN THIS ROLE</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === role.name).length}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedRole(role)
                  setShowEditRoleModal(true)
                }}
                className="mt-4 w-full border border-primary-600 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 font-medium transition hover:bg-primary-100"
              >
                ✏️ Edit Role
              </button>
            </div>
          ))}
        </div>

        {/* Edit Role Modal */}
        {showEditRoleModal && selectedRole && (
          <EditRoleModal
            role={selectedRole}
            allPermissions={permissions}
            users={users}
            onClose={() => {
              setShowEditRoleModal(false)
              setSelectedRole(null)
            }}
            onSave={(updatedRole) => {
              // Update role in local state if needed
              console.log('Role updated:', updatedRole)
            }}
          />
        )}
      )}

      {/* PERMISSIONS TAB */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-6">Permission Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Permission</th>
                  {roles.map(role => (
                    <th key={role.name} className="px-6 py-4 text-center font-semibold text-xs">{role.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  'View All Assets',
                  'Edit Assets',
                  'Delete Assets',
                  'Approve Changes',
                  'Manage Users',
                  'Access Audit Logs',
                  'Export Reports',
                  'Configure Settings',
                ].map(perm => (
                  <tr key={perm} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{perm}</td>
                    {roles.map(role => (
                      <td key={role.name} className="px-6 py-4 text-center">
                        <input type="checkbox" className="w-5 h-5" defaultChecked={role.name === 'Admin'} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT TRAIL TAB */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {auditLogs.map(log => (
            <div key={log.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-600">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{log.user}</p>
                  <p className="text-gray-600 text-sm">{log.action}</p>
                  <p className="text-gray-500 text-xs mt-1">{log.details}</p>
                </div>
                <span className="text-gray-500 text-sm whitespace-nowrap">{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
