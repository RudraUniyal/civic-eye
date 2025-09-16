'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import RouteGuard from '@/components/RouteGuard'
import Link from 'next/link'

interface Issue {
  id: string
  photoUrl: string
  category: string
  notes: string | null
  status: string
  createdAt: Date
  location: {
    latitude: number
    longitude: number
  }
}

export default function IssueDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const issueId = params.id as string

  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadIssue()
  }, [issueId])

  const loadIssue = async () => {
    try {
      const response = await fetch(`/api/admin/issues/${issueId}`)
      if (response.ok) {
        const data = await response.json()
        setIssue(data.issue)
      } else {
        setError('Issue not found')
      }
    } catch (error) {
      console.error('Error loading issue:', error)
      setError('Failed to load issue')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await loadIssue() // Reload to show updated status
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update issue status')
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium"
    switch (status) {
      case 'reported':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'in-progress':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'solved':
        return `${baseClasses} bg-green-100 text-green-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getCategoryEmoji = (category: string) => {
    const categoryEmojis = {
      pothole: '🕳️',
      garbage: '🗑️',
      streetlight: '💡',
      graffiti: '🎨',
      other: '❓'
    }
    return categoryEmojis[category as keyof typeof categoryEmojis] || '❓'
  }

  if (loading) {
    return (
      <RouteGuard requireAuth requireAdmin>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-civic-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading issue details...</p>
          </div>
        </div>
      </RouteGuard>
    )
  }

  if (error || !issue) {
    return (
      <RouteGuard requireAuth requireAdmin>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Issue Not Found</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link
              href="/admin"
              className="bg-civic-primary text-white px-6 py-3 rounded-lg hover:bg-civic-primary-dark transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </RouteGuard>
    )
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
                <h1 className="text-xl font-semibold text-gray-900">Issue Details</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Issue Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryEmoji(issue.category)}</span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 capitalize">
                      {issue.category} Issue
                    </h2>
                    <p className="text-sm text-gray-500">
                      Reported on {new Date(issue.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <span className={getStatusBadge(issue.status)}>
                  {issue.status}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Photo */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Issue Photo</h3>
                  {issue.photoUrl && issue.photoUrl !== 'no-photo' ? (
                    <div className="rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={issue.photoUrl}
                        alt="Issue photo"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl">{getCategoryEmoji(issue.category)}</span>
                        <p className="text-gray-500 mt-2">No photo available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {issue.notes || 'No description provided'}
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Location</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">
                        <span className="font-medium">Latitude:</span> {issue.location.latitude.toFixed(6)}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Longitude:</span> {issue.location.longitude.toFixed(6)}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${issue.location.latitude},${issue.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-civic-primary hover:text-civic-primary-dark text-sm font-medium"
                      >
                        📍 View on Google Maps →
                      </a>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      {issue.status === 'reported' && (
                        <button
                          onClick={() => updateStatus('in-progress')}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                        >
                          🔧 Start Work
                        </button>
                      )}
                      
                      {issue.status === 'in-progress' && (
                        <Link
                          href={`/admin/issues/${issue.id}/solve`}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium inline-block"
                        >
                          ✅ Mark as Solved
                        </Link>
                      )}

                      {issue.status === 'solved' && (
                        <div className="flex items-center text-green-600 font-medium">
                          <span className="mr-2">✅</span>
                          Issue has been resolved
                        </div>
                      )}

                      {issue.status !== 'solved' && (
                        <button
                          onClick={() => updateStatus('solved')}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                          Quick Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  )
}