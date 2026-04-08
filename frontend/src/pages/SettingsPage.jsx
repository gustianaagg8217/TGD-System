import { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">System Settings</h1>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'general'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'security'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === 'notifications'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Notifications
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">General Settings</h2>
            <div>
              <label className="block text-sm font-medium mb-2">System Name</label>
              <input
                type="text"
                defaultValue="TGd System"
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Organization</label>
              <input
                type="text"
                defaultValue="Your Organization"
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
              Save Changes
            </button>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Security Settings</h2>
            <div>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="font-medium">Enable Two-Factor Authentication</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="font-medium">Session Timeout (30 min)</span>
              </label>
            </div>
            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
              Update Security
            </button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Notification Preferences</h2>
            <div>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="font-medium">Email Alerts</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="font-medium">Maintenance Reminders</span>
              </label>
            </div>
            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
              Save Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
