'use client'

import RouteGuard from '@/components/RouteGuard'
import Link from 'next/link'

export default function ResetDataPage() {
  return (
    <RouteGuard requireAuth requireAdmin>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← Back to Dashboard
                </Link>
                <h1 className="text-xl font-semibold text-gray-900">Reset Data</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">
                  Danger Zone
                </h3>
                <p className="text-red-700 mt-1">
                  These actions permanently delete data and cannot be undone. Use with extreme caution.
                </p>
              </div>
            </div>
          </div>

          {/* Reset Functionality Removed */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reset Functionality Disabled
              </h3>
              <p className="text-gray-600 mb-4">
                The data reset functionality has been removed for security purposes.
              </p>
              <p className="text-sm text-gray-500">
                Contact your system administrator if you need to reset data.
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-2xl">ℹ️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-800">
                  What gets reset?
                </h3>
                <div className="text-blue-700 mt-2 space-y-2">
                  <p><strong>Firebase:</strong> All issue reports, status updates, and admin actions</p>
                  <p><strong>Supabase Storage:</strong> All uploaded photos in the issue-photos bucket</p>
                  <p><strong>Not affected:</strong> User accounts, authentication data, app configuration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  )
}