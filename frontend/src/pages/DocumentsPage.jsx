import { useState, useEffect } from 'react'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [activeTab, setActiveTab] = useState('documents')
  const [viewMode, setViewMode] = useState('list')

  const [formData, setFormData] = useState({
    title: '',
    category: 'technical_drawings',
    documentType: 'pdf',
    description: '',
    uploadedBy: 'Admin User',
    accessLevel: 'restricted',
    relatedAsset: '',
  })

  const categories = [
    { value: 'technical_drawings', label: '📐 Technical Drawings' },
    { value: 'contracts', label: '📜 Contracts' },
    { value: 'licenses', label: '📋 Licenses & Permits' },
    { value: 'compliance', label: '✅ Compliance Docs' },
    { value: 'manuals', label: '📖 Manuals' },
    { value: 'certificates', label: '🏆 Certificates' },
  ]

  const documentTypes = [
    { value: 'pdf', label: 'PDF', icon: '📄' },
    { value: 'dwg', label: 'AutoCAD DWG', icon: '🏗️' },
    { value: 'gis', label: 'GIS Shapefile', icon: '🗺️' },
    { value: 'image', label: 'Image', icon: '🖼️' },
    { value: 'excel', label: 'Excel', icon: '📊' },
    { value: 'word', label: 'Word', icon: '📝' },
    { value: 'other', label: 'Other', icon: '📁' },
  ]

  const accessLevels = ['public', 'internal', 'restricted', 'confidential']

  useEffect(() => {
    // Simulate fetching documents
    setTimeout(() => {
      const documentsData = [
        {
          id: 1,
          title: 'CNC Machine Layout - Site Plan',
          category: 'technical_drawings',
          documentType: 'dwg',
          description: 'AutoCAD drawing showing CNC machining center positioning and electrical connections',
          uploadedBy: 'Admin User',
          uploadedDate: '2026-03-15',
          fileSize: '4.2 MB',
          accessLevel: 'internal',
          relatedAsset: 'CNC Machining Center A',
          versions: [
            { version: '3.0', date: '2026-04-06', uploadedBy: 'Admin User', changes: 'Updated electrical specs' },
            { version: '2.5', date: '2026-03-20', uploadedBy: 'Tech Lead', changes: 'Minor layout adjustments' },
            { version: '2.0', date: '2026-03-15', uploadedBy: 'Admin User', changes: 'Initial layout' },
          ],
          downloads: 24,
          lastDownloadedBy: 'Maintenance Team',
          lastDownloadedDate: '2026-04-06',
          accessLog: [
            { user: 'Maintenance Team', action: 'Downloaded', date: '2026-04-06 10:30' },
            { user: 'Engineering Dept', action: 'Viewed', date: '2026-04-05 14:15' },
            { user: 'Workshop Staff', action: 'Downloaded', date: '2026-04-04 09:00' },
          ],
          permissions: [
            { email: 'maintenance@tgd.com', access: 'view', grantedBy: 'Admin', grantedDate: '2026-03-15' },
            { email: 'engineering@tgd.com', access: 'edit', grantedBy: 'Admin', grantedDate: '2026-03-15' },
          ],
        },
        {
          id: 2,
          title: 'Equipment Maintenance Contract 2026',
          category: 'contracts',
          documentType: 'pdf',
          description: 'Annual service agreement with supplier for preventive maintenance of all machinery',
          uploadedBy: 'Legal Dept',
          uploadedDate: '2026-01-10',
          fileSize: '2.8 MB',
          accessLevel: 'restricted',
          relatedAsset: 'All Equipment',
          versions: [
            { version: '1.1', date: '2026-01-10', uploadedBy: 'Legal Dept', changes: 'Final executed copy' },
            { version: '1.0', date: '2025-12-15', uploadedBy: 'Legal Dept', changes: 'Initial draft' },
          ],
          downloads: 8,
          lastDownloadedBy: 'Finance Manager',
          lastDownloadedDate: '2026-03-30',
          accessLog: [
            { user: 'Finance Manager', action: 'Downloaded', date: '2026-03-30 11:20' },
            { user: 'Operations Manager', action: 'Viewed', date: '2026-03-20 15:45' },
          ],
          permissions: [
            { email: 'finance@tgd.com', access: 'view', grantedBy: 'Admin', grantedDate: '2026-01-10' },
            { email: 'operations@tgd.com', access: 'view', grantedBy: 'Admin', grantedDate: '2026-01-10' },
          ],
        },
        {
          id: 3,
          title: 'Machine Operating License - Factory Unit',
          category: 'licenses',
          documentType: 'pdf',
          description: 'Official government license to operate CNC and hydraulic equipment in factory',
          uploadedBy: 'Admin User',
          uploadedDate: '2025-11-20',
          fileSize: '1.5 MB',
          accessLevel: 'internal',
          relatedAsset: 'All Machinery',
          versions: [
            { version: '2.0', date: '2025-11-20', uploadedBy: 'Admin User', changes: 'Renewal certificate' },
            { version: '1.0', date: '2024-11-15', uploadedBy: 'Admin User', changes: 'Original license' },
          ],
          downloads: 15,
          lastDownloadedBy: 'Compliance Officer',
          lastDownloadedDate: '2026-04-05',
          accessLog: [
            { user: 'Compliance Officer', action: 'Downloaded', date: '2026-04-05 09:00' },
            { user: 'Operations Manager', action: 'Viewed', date: '2026-03-15 10:30' },
          ],
          permissions: [
            { email: 'compliance@tgd.com', access: 'view', grantedBy: 'Admin', grantedDate: '2025-11-20' },
            { email: 'operations@tgd.com', access: 'view', grantedBy: 'Admin', grantedDate: '2025-11-20' },
          ],
        },
        {
          id: 4,
          title: 'Factory Safety Standards Audit Report',
          category: 'compliance',
          documentType: 'pdf',
          description: 'Latest OSHA compliance audit results and recommendations',
          uploadedBy: 'Safety Manager',
          uploadedDate: '2026-02-28',
          fileSize: '3.1 MB',
          accessLevel: 'confidential',
          relatedAsset: 'All Assets',
          versions: [
            { version: '1.0', date: '2026-02-28', uploadedBy: 'Safety Manager', changes: 'Q1 2026 audit' },
          ],
          downloads: 5,
          lastDownloadedBy: 'Safety Manager',
          lastDownloadedDate: '2026-04-01',
          accessLog: [
            { user: 'Safety Manager', action: 'Downloaded', date: '2026-04-01 13:20' },
            { user: 'Facility Manager', action: 'Viewed', date: '2026-03-25 10:00' },
          ],
          permissions: [
            { email: 'safety@tgd.com', access: 'edit', grantedBy: 'Admin', grantedDate: '2026-02-28' },
            { email: 'facility@tgd.com', access: 'view', grantedBy: 'Admin', grantedDate: '2026-02-28' },
          ],
        },
        {
          id: 5,
          title: 'Warehouse Layout - GIS Map',
          category: 'technical_drawings',
          documentType: 'gis',
          description: 'GIS shapefile with warehouse zones, storage locations, and access routes',
          uploadedBy: 'Logistics Dept',
          uploadedDate: '2026-03-10',
          fileSize: '5.6 MB',
          accessLevel: 'internal',
          relatedAsset: 'Warehouse Infrastructure',
          versions: [
            { version: '2.1', date: '2026-04-06', uploadedBy: 'Logistics Dept', changes: 'Added new zone C' },
            { version: '2.0', date: '2026-03-10', uploadedBy: 'Logistics Dept', changes: 'GIS conversion' },
          ],
          downloads: 18,
          lastDownloadedBy: 'Warehouse Manager',
          lastDownloadedDate: '2026-04-06',
          accessLog: [
            { user: 'Warehouse Manager', action: 'Downloaded', date: '2026-04-06 16:45' },
            { user: 'Logistics Team', action: 'Viewed', date: '2026-04-05 08:30' },
          ],
          permissions: [
            { email: 'logistics@tgd.com', access: 'edit', grantedBy: 'Admin', grantedDate: '2026-03-10' },
            { email: 'warehouse@tgd.com', access: 'view', grantedBy: 'Admin', grantedDate: '2026-03-10' },
          ],
        },
        {
          id: 6,
          title: 'Equipment Operation Manual - Hydraulic Press',
          category: 'manuals',
          documentType: 'pdf',
          description: 'Complete operating procedures and safety guidelines for Hydac hydraulic press',
          uploadedBy: 'Technical Documentation',
          uploadedDate: '2025-12-01',
          fileSize: '8.3 MB',
          accessLevel: 'public',
          relatedAsset: 'Hydraulic Press B',
          versions: [
            { version: '3.2', date: '2026-04-06', uploadedBy: 'Technical Dept', changes: 'Updated warnings' },
            { version: '3.1', date: '2026-02-15', uploadedBy: 'Technical Dept', changes: 'Safety updates' },
            { version: '3.0', date: '2025-12-01', uploadedBy: 'Technical Dept', changes: 'Latest edition' },
          ],
          downloads: 47,
          lastDownloadedBy: 'Workshop Staff',
          lastDownloadedDate: '2026-04-06',
          accessLog: [
            { user: 'Workshop Staff', action: 'Downloaded', date: '2026-04-06 11:45' },
            { user: 'Operators Team', action: 'Viewed', date: '2026-04-04 14:00' },
            { user: 'Training Dept', action: 'Downloaded', date: '2026-03-20 09:30' },
          ],
          permissions: [
            { email: 'all-staff@tgd.com', access: 'view', grantedBy: 'Admin', grantedDate: '2025-12-01' },
          ],
        },
      ]
      setDocuments(documentsData)
      setFilteredDocuments(documentsData)
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    let filtered = documents

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.relatedAsset.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === filterCategory)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(doc => doc.accessLevel === filterStatus)
    }

    setFilteredDocuments(filtered)
  }, [searchTerm, filterCategory, filterStatus, documents])

  const handleAddDocument = (e) => {
    e.preventDefault()
    const newDoc = {
      id: documents.length + 1,
      ...formData,
      uploadedDate: new Date().toISOString().split('T')[0],
      fileSize: '0 MB',
      versions: [
        { version: '1.0', date: new Date().toISOString().split('T')[0], uploadedBy: formData.uploadedBy, changes: 'Initial upload' },
      ],
      downloads: 0,
      lastDownloadedBy: 'N/A',
      lastDownloadedDate: 'N/A',
      accessLog: [
        { user: formData.uploadedBy, action: 'Uploaded', date: new Date().toISOString() },
      ],
      permissions: [],
    }
    setDocuments([...documents, newDoc])
    setFormData({
      title: '',
      category: 'technical_drawings',
      documentType: 'pdf',
      description: '',
      uploadedBy: 'Admin User',
      accessLevel: 'restricted',
      relatedAsset: '',
    })
    setShowAddForm(false)
  }

  const getCategoryIcon = (category) => {
    return categories.find(c => c.value === category)?.label.split(' ')[0] || '📁'
  }

  const getAccessIcon = (level) => {
    const icons = { public: '🌐', internal: '🔒', restricted: '🔐', confidential: '🔒🔒' }
    return icons[level] || '🔐'
  }

  const getAccessColor = (level) => {
    switch (level) {
      case 'public':
        return 'bg-blue-100 text-blue-800'
      case 'internal':
        return 'bg-green-100 text-green-800'
      case 'restricted':
        return 'bg-yellow-100 text-yellow-800'
      case 'confidential':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    total: documents.length,
    byCategory: {},
    totalDownloads: documents.reduce((sum, doc) => sum + doc.downloads, 0),
    totalVersions: documents.reduce((sum, doc) => sum + doc.versions.length, 0),
  }

  categories.forEach(cat => {
    stats.byCategory[cat.value] = documents.filter(d => d.category === cat.value).length
  })

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Loading documents...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Digital Document & Drawing Repository</h1>
          <p className="text-gray-600 mt-2">Store, manage, and control access to technical drawings, contracts, and compliance documents</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          + Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Documents</h3>
          <p className="text-4xl font-bold text-primary-600">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Downloads</h3>
          <p className="text-4xl font-bold text-green-600">{stats.totalDownloads}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Versions</h3>
          <p className="text-4xl font-bold text-blue-600">{stats.totalVersions}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Storage Used</h3>
          <p className="text-3xl font-bold text-orange-600">{(documents.reduce((sum, d) => sum + parseFloat(d.fileSize), 0)).toFixed(1)} MB</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-lg shadow p-2">
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'documents'
              ? 'bg-primary-600 text-white'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          📄 All Documents
        </button>
        <button
          onClick={() => setActiveTab('versions')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'versions'
              ? 'bg-primary-600 text-white'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          📚 Version History
        </button>
        <button
          onClick={() => setActiveTab('access')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'access'
              ? 'bg-primary-600 text-white'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          👥 Access Control
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'activity'
              ? 'bg-primary-600 text-white'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          📋 Activity Log
        </button>
      </div>

      {/* Upload Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Upload New Document</h2>
          <form onSubmit={handleAddDocument} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Document Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., CNC Machine Layout - Site Plan"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Document Type *</label>
              <select
                required
                value={formData.documentType}
                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Access Level *</label>
              <select
                required
                value={formData.accessLevel}
                onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {accessLevels.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Related Asset</label>
              <input
                type="text"
                placeholder="e.g., CNC Machining Center A"
                value={formData.relatedAsset}
                onChange={(e) => setFormData({ ...formData, relatedAsset: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                placeholder="Document description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Upload Document
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Documents</label>
            <input
              type="text"
              placeholder="Search by title, description, asset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Access Level</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Levels</option>
              {accessLevels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            viewMode === 'list'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          📋 List View
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            viewMode === 'grid'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          📊 Card View
        </button>
      </div>

      {/* ALL DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <>
          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Title</th>
                    <th className="px-6 py-4 text-left font-semibold">Category</th>
                    <th className="px-6 py-4 text-left font-semibold">Type</th>
                    <th className="px-6 py-4 text-left font-semibold">Size</th>
                    <th className="px-6 py-4 text-left font-semibold">Access</th>
                    <th className="px-6 py-4 text-left font-semibold">Uploaded</th>
                    <th className="px-6 py-4 text-left font-semibold">Downloads</th>
                    <th className="px-6 py-4 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map(doc => (
                    <tr key={doc.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium max-w-xs">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="text-primary-600 hover:text-primary-800 truncate"
                        >
                          {doc.title}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">{getCategoryIcon(doc.category)} {categories.find(c => c.value === doc.category)?.label.split(' ')[1]}</td>
                      <td className="px-6 py-4 text-sm font-medium">{doc.documentType.toUpperCase()}</td>
                      <td className="px-6 py-4 text-sm">{doc.fileSize}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAccessColor(doc.accessLevel)}`}>
                          {getAccessIcon(doc.accessLevel)} {doc.accessLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{doc.uploadedDate}</td>
                      <td className="px-6 py-4 font-semibold">{doc.downloads}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDocuments.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No documents found matching your filters
                </div>
              )}
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map(doc => (
                <div
                  key={doc.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="mb-4">
                    <p className="text-2xl mb-2">{documentTypes.find(t => t.value === doc.documentType)?.icon}</p>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{doc.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{doc.description}</p>
                  </div>

                  <div className="space-y-2 mb-4 text-sm border-t pt-4">
                    <p><span className="font-medium">Category:</span> {categories.find(c => c.value === doc.category)?.label}</p>
                    <p><span className="font-medium">Size:</span> {doc.fileSize}</p>
                    <p><span className="font-medium">Uploaded:</span> {doc.uploadedDate}</p>
                    <p><span className="font-medium">Downloads:</span> {doc.downloads}</p>
                  </div>

                  <div className="flex gap-2 items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAccessColor(doc.accessLevel)}`}>
                      {getAccessIcon(doc.accessLevel)} {doc.accessLevel}
                    </span>
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* VERSION HISTORY TAB */}
      {activeTab === 'versions' && (
        <div className="space-y-4">
          {filteredDocuments.map(doc => (
            <div key={doc.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">{doc.title}</h3>
              <div className="space-y-2">
                {doc.versions.map((version, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg border-l-4 border-primary-600 flex justify-between items-start">
                    <div>
                      <p className="font-medium">Version {version.version}</p>
                      <p className="text-sm text-gray-600">{version.date} by {version.uploadedBy}</p>
                      <p className="text-sm text-gray-700 mt-1">{version.changes}</p>
                    </div>
                    <button className="text-primary-600 hover:text-primary-800 font-medium text-sm white-nowrap ml-2">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ACCESS CONTROL TAB */}
      {activeTab === 'access' && (
        <div className="space-y-4">
          {filteredDocuments.map(doc => (
            <div key={doc.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">{doc.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Access Level: {getAccessIcon(doc.accessLevel)} {doc.accessLevel}</h4>
                  <div className="space-y-2">
                    {doc.permissions.map((perm, idx) => (
                      <div key={idx} className="bg-blue-50 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{perm.email}</p>
                          <p className="text-xs text-gray-600">Access: {perm.access} | Granted: {perm.grantedDate}</p>
                        </div>
                        <button className="text-red-600 hover:text-red-800 text-sm">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Add New Access</h4>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    className="w-full border rounded-lg px-4 py-2 mb-2"
                  />
                  <select className="w-full border rounded-lg px-4 py-2 mb-2">
                    <option>View</option>
                    <option>Edit</option>
                    <option>Admin</option>
                  </select>
                  <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition">
                    Grant Access
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ACTIVITY LOG TAB */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          {filteredDocuments.map(doc => (
            <div key={doc.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">{doc.title}</h3>
              <div className="space-y-2">
                {doc.accessLog.map((log, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center text-sm border-l-4 border-gray-400">
                    <div>
                      <p className="font-medium">{log.user}</p>
                      <p className="text-xs text-gray-600">{log.date}</p>
                    </div>
                    <span className="bg-gray-200 px-3 py-1 rounded-full text-xs font-medium">{log.action}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Details Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto shadow-xl">
            <div className="p-6 border-b flex justify-between items-start sticky top-0 bg-white">
              <div>
                <h2 className="text-2xl font-bold">{selectedDoc.title}</h2>
                <p className="text-gray-600 text-sm mt-1">{documentTypes.find(t => t.value === selectedDoc.documentType)?.icon} {selectedDoc.documentType.toUpperCase()}</p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-bold text-blue-700">{categories.find(c => c.value === selectedDoc.category)?.label}</p>
                </div>
                <div className={`p-4 rounded-lg ${getAccessColor(selectedDoc.accessLevel)}`}>
                  <p className="text-sm">Access Level</p>
                  <p className="font-bold">{getAccessIcon(selectedDoc.accessLevel)} {selectedDoc.accessLevel}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">File Size</p>
                  <p className="font-bold text-green-700">{selectedDoc.fileSize}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Downloads</p>
                  <p className="font-bold text-purple-700">{selectedDoc.downloads}</p>
                </div>
              </div>

              {selectedDoc.description && (
                <div>
                  <h3 className="font-bold mb-2">Description</h3>
                  <p className="text-gray-700">{selectedDoc.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Uploaded By</p>
                  <p className="font-medium">{selectedDoc.uploadedBy}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Upload Date</p>
                  <p className="font-medium">{selectedDoc.uploadedDate}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Last Downloaded</p>
                  <p className="font-medium">{selectedDoc.lastDownloadedDate}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Related Asset</p>
                  <p className="font-medium">{selectedDoc.relatedAsset || 'N/A'}</p>
                </div>
              </div>

              {selectedDoc.versions.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3">Version History ({selectedDoc.versions.length})</h3>
                  <div className="space-y-2">
                    {selectedDoc.versions.map((v, idx) => (
                      <p key={idx} className="text-sm bg-gray-50 p-2 rounded">
                        <span className="font-medium">v{v.version}</span> - {v.date} ({v.changes})
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition font-medium">
                  ⬇️ Download
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                  🔗 Share
                </button>
                <button className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition font-medium">
                  ⚙️ Manage
                </button>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
