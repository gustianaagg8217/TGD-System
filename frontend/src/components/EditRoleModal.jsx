import { useState } from 'react'
import roleService from '../services/roleService'

export default function EditRoleModal({ role, allPermissions, onClose, onSave, users }) {
  // Safety check - role must have ID
  if (!role || !role.id) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Error</h2>
          <p className="text-gray-700 mb-6">Role data tidak valid. Silakan coba lagi.</p>
          <button onClick={onClose} className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            Close
          </button>
        </div>
      </div>
    )
  }

  // State
  const [name, setName] = useState(role.name || '')
  const [description, setDescription] = useState(role.description || '')
  const [selectedPerms, setSelectedPerms] = useState(new Set(role.permissions || []))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const defaultPerms = ['view-all', 'edit-all', 'delete-assets', 'create-asset', 'edit-maintenance', 'approve', 'manage-users', 'export-reports', 'view-audit', 'edit-roles']
  const permsToShow = (allPermissions && Array.isArray(allPermissions) && allPermissions.length > 0) ? allPermissions : defaultPerms
  const usersCount = (Array.isArray(users) ? users.filter(u => u.role === role.name).length : 0)

  const togglePerm = (perm) => {
    const newSet = new Set(selectedPerms)
    if (newSet.has(perm)) {
      newSet.delete(perm)
    } else {
      newSet.add(perm)
    }
    setSelectedPerms(newSet)
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')

    if (!name.trim()) {
      setError('Role name harus diisi')
      return
    }

    if (!description.trim()) {
      setError('Description harus diisi')
      return
    }

    setLoading(true)

    try {
      await roleService.updateRole(role.id, {
        name,
        description,
        permissions: Array.from(selectedPerms),
      })

      setSuccess('✓ Role berhasil diupdate!')

      if (onSave) {
        onSave({ ...role, name, description, permissions: Array.from(selectedPerms) })
      }

      setTimeout(() => onClose(), 1500)
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Gagal update role'
      setError(`❌ ${msg}`)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Edit Role</h2>
          <p className="text-gray-500 mb-6">{role.name}</p>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 font-medium">👥 Users: <span className="text-2xl font-bold">{usersCount}</span></p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Role Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Role Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                placeholder="e.g., Engineer"
                disabled={role.name === 'Admin'}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                placeholder="Describe this role..."
              />
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Permissions</label>
              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                {permsToShow.map((perm) => (
                  <label key={perm} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPerms.has(perm)}
                      onChange={() => togglePerm(perm)}
                      className="w-4 h-4 rounded"
                      disabled={role.name === 'Admin'}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {perm.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold disabled:bg-gray-400 transition"
              >
                {loading ? '⏳ Saving...' : '✓ Save Changes'}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-bold disabled:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
