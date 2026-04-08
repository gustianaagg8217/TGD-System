/**
 * EditRoleModal Component
 * Modal dialog for editing role information and permissions
 */

import { useState, useEffect } from 'react'
import roleService from '../services/roleService'

export default function EditRoleModal({ role, allPermissions, onClose, onSave, users }) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    permissions: role?.permissions || [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState(new Set(role?.permissions || []))

  useEffect(() => {
    if (role?.permissions) {
      setSelectedPermissions(new Set(role.permissions))
    }
  }, [role])

  const handlePermissionToggle = (permission) => {
    const newPermissions = new Set(selectedPermissions)
    if (newPermissions.has(permission)) {
      newPermissions.delete(permission)
    } else {
      newPermissions.add(permission)
    }
    setSelectedPermissions(newPermissions)
    setFormData({ ...formData, permissions: Array.from(newPermissions) })
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validation
      if (!formData.name.trim()) {
        setError('Role name tidak boleh kosong')
        setLoading(false)
        return
      }

      if (!formData.description.trim()) {
        setError('Deskripsi role tidak boleh kosong')
        setLoading(false)
        return
      }

      // Call API to update role
      const response = await roleService.updateRoleByName(role.name, {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      })

      setSuccess('Role berhasil diperbarui!')
      
      // Call parent onSave handler
      if (onSave) {
        onSave({
          ...role,
          ...formData,
          permissions: formData.permissions,
        })
      }

      // Close modal after 1 second
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (err) {
      setError(err.message || 'Gagal menyimpan role. Silakan coba lagi.')
      console.error('Error updating role:', err)
    } finally {
      setLoading(false)
    }
  }

  const usersInRole = users.filter(u => u.role === role?.name).length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Edit Role: {role?.name}</h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center">
            <span className="mr-2">❌</span>
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-center">
            <span className="mr-2">✓</span>
            {success}
          </div>
        )}

        {/* Role Info Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Users in this role</p>
          <p className="text-2xl font-bold text-primary-600">{usersInRole}</p>
        </div>

        {/* Form Section */}
        <div className="space-y-4 mb-6">
          {/* Role Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">Role Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Engineer, Auditor, Operator"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
              disabled={role?.name === 'Admin'} // Can't change Admin role name
            />
            {role?.name === 'Admin' && (
              <p className="text-xs text-gray-600 mt-1">💡 Admin role name cannot be modified</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose of this role..."
              rows="3"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-semibold mb-3">Permissions</label>
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border">
              {allPermissions.map(permission => (
                <label
                  key={permission}
                  className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.has(permission)}
                    onChange={() => handlePermissionToggle(permission)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-600"
                    disabled={role?.name === 'Admin'} // Admin has all permissions
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    {permission
                      .replace(/[-_]/g, ' ')
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
            {role?.name === 'Admin' && (
              <p className="text-xs text-gray-600 mt-2">
                💡 Admin role automatically has all permissions
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? '⏳ Saving...' : '✓ Save Changes'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Cancel
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>ℹ️ Note:</strong> Changes to role permissions will affect all users in this role immediately.
          </p>
        </div>
      </div>
    </div>
  )
}
