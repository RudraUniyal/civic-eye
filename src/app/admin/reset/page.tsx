'use client'

import { useState } from 'react'
import RouteGuard from '@/components/RouteGuard'
import Link from 'next/link'

export default function ResetDataPage() {
  const [isResetting, setIsResetting] = useState(false)
  const [resetResult, setResetResult] = useState<{ success: boolean; message: string; deletedCount?: number } | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleResetData = async () => {
    setIsResetting(true)
    setResetResult(null)
    
    try {
      const response = await fetch('/api/admin/reset', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      setResetResult(result)
      setShowConfirmation(false)
    } catch (error) {
      console.error('Error resetting data:', error)
      setResetResult({
        success: false,
        message: 'Failed to reset data. Please try again.'
      })
    } finally {
      setIsResetting(false)
    }
  }
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

          {/* Reset Functionality */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reset All Issues Data
              </h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete all reported issues from the database. This action cannot be undone.
              </p>
              
              {!showConfirmation ? (
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  disabled={isResetting}
                >
                  Reset All Issues
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-red-600 font-medium">
                    Are you absolutely sure? This will delete ALL issues permanently.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleResetData}
                      disabled={isResetting}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResetting ? 'Resetting...' : 'Yes, Delete All Issues'}
                    </button>
                    <button
                      onClick={() => setShowConfirmation(false)}
                      disabled={isResetting}
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {/* Result Message */}
              {resetResult && (
                <div className={`mt-6 p-4 rounded-lg ${
                  resetResult.success 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <p className="font-medium">
                    {resetResult.success ? '✅' : '❌'} {resetResult.message}
                  </p>
                  {resetResult.success && resetResult.deletedCount !== undefined && (
                    <p className="text-sm mt-1">
                      Deleted {resetResult.deletedCount} issue{resetResult.deletedCount === 1 ? '' : 's'}
                    </p>
                  )}
                </div>
              )}
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