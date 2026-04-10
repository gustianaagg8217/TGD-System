import { useState, useEffect, useContext } from 'react'
import { assetService } from '../services/assetService'
import { LanguageContext } from '../context/LanguageContext'

export default function AssetFormModal({ asset, onClose, onSave, isEdit = false }) {
  const { t } = useContext(LanguageContext)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    status: 'active',
    acquisition_date: '',
    value: '',
    asset_metadata: {},
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const assetTypes = [
    'Mining Equipment',
    'Processing Facilities',
    'Fleet & Vehicles',
    'Infrastructure',
    'Land & Concessions',
    'Digital Assets',
    'IT Infrastructure',
    'Consumables',
    'Environmental',
  ]

  const statusOptions = ['active', 'inactive', 'maintenance', 'retired']

  useEffect(() => {
    if (asset && isEdit) {
      setFormData({
        name: asset.name || '',
        type: asset.type || '',
        location: asset.location || '',
        status: asset.status || 'active',
        acquisition_date: asset.acquisition_date || '',
        value: asset.value || '',
        asset_metadata: asset.asset_metadata || {},
      })
    }
  }, [asset, isEdit])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleMetadataChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      asset_metadata: {
        ...prev.asset_metadata,
        [name]: value
      }
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError(t('forms.nameRequired'))
      return false
    }
    if (!formData.type.trim()) {
      setError(t('forms.typeRequired'))
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Convert value to number if it exists
      const dataToSend = {
        ...formData,
        value: formData.value ? parseFloat(formData.value) : null,
      }

      if (isEdit && asset?.id) {
        // Update existing asset
        await assetService.updateAsset(asset.id, dataToSend)
        setSuccess(t('assets.updateSuccess'))
      } else {
        // Create new asset
        await assetService.createAsset(dataToSend)
        setSuccess(t('assets.saveSuccess'))
      }

      if (onSave) {
        onSave()
      }

      setTimeout(() => onClose(), 1500)
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || t('assets.errorSaving')
      setError(`${msg}`)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {isEdit ? '✏️ ' + t('assets.editAsset') : '➕ ' + t('assets.addAsset')}
          </h2>
          <p className="text-gray-500 mt-1">
            {isEdit ? `${t('assets.edit')}: ${asset?.name}` : t('assets.addAsset')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Alerts */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Informasi Dasar</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Asset Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Asset *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Excavator CAT 390F"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Asset Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipe Asset *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Pilih Tipe --</option>
                  {assetTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lokasi (Opsional)
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Block Alpha"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Informasi Tambahan</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Acquisition Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Perolehan
                </label>
                <input
                  type="date"
                  name="acquisition_date"
                  value={formData.acquisition_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Asset Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nilai Asset (USD)
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  placeholder="e.g., 1050000"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Additional Metadata */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Detail Tambahan (Opsional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hours/Capacity Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Operasi / Kapasitas
                </label>
                <input
                  type="text"
                  name="hours_or_capacity"
                  value={formData.asset_metadata.hours_or_capacity || ''}
                  onChange={handleMetadataChange}
                  placeholder="e.g., 8500 hours"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Manufacturer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pabrikan / Merek
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.asset_metadata.manufacturer || ''}
                  onChange={handleMetadataChange}
                  placeholder="e.g., Caterpillar"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan / Deskripsi
              </label>
              <textarea
                name="notes"
                value={formData.asset_metadata.notes || ''}
                onChange={handleMetadataChange}
                placeholder="Masukkan catatan tambahan tentang asset..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {t('forms.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  {t('forms.saving')}
                </>
              ) : (
                <>
                  {isEdit ? '💾 ' + t('forms.update') : '✅ ' + t('forms.add')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
