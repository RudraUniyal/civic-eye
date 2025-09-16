'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import RouteGuard from '@/components/RouteGuard'
import { Issue } from '@/lib/firebase'
import Link from 'next/link'

interface IssueWithId extends Issue {
  id: string
}

export default function AdminDashboard() {
  const [issues, setIssues] = useState<IssueWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'reported' | 'in-progress' | 'solved'>('all')
  const { userProfile, logout } = useAuth()

  useEffect(() => {
    loadIssues()
  }, [])

  const loadIssues = async () => {
    try {
      const response = await fetch('/api/admin/issues')
      if (response.ok) {
        const data = await response.json()
        setIssues(data.issues || [])
      }
    } catch (error) {
      console.error('Error loading issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Reload issues to reflect changes
        await loadIssues()
      } else {
        throw new Error('Failed to update issue status')
      }
    } catch (error) {
      console.error('Error updating issue status:', error)
      alert('Failed to update issue status')
    }
  }

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true
    return issue.status === filter
  })

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
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

  return (
    <RouteGuard requireAuth requireAdmin>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-civic-primary transition-colors font-medium flex items-center space-x-1"
                >
                  <span>🏠</span>
                  <span>Home</span>
                </Link>
                <span className="text-sm text-gray-600">
                  Welcome, {userProfile?.displayName}
                </span>
                <button
                  onClick={() => logout()}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                    📋
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Issues</p>
                  <p className="text-2xl font-semibold text-gray-900">{issues.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                    🚨
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Reported</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {issues.filter(i => i.status === 'reported').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                    🔧
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">In Progress</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {issues.filter(i => i.status === 'in-progress').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    ✅
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Solved</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {issues.filter(i => i.status === 'solved').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { key: 'all', label: 'All Issues', count: issues.length },
                  { key: 'reported', label: 'Reported', count: issues.filter(i => i.status === 'reported').length },
                  { key: 'in-progress', label: 'In Progress', count: issues.filter(i => i.status === 'in-progress').length },
                  { key: 'solved', label: 'Solved', count: issues.filter(i => i.status === 'solved').length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      filter === tab.key
                        ? 'border-civic-primary text-civic-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>

            {/* Issues Table */}
            <div className="overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading issues...</p>
                </div>
              ) : filteredIssues.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No issues found for the current filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Issue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredIssues.map((issue) => (
                        <tr key={issue.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {issue.photoUrl && issue.photoUrl !== 'no-photo' ? (
                                  <img
                                    className="h-10 w-10 rounded-lg object-cover"
                                    src={issue.photoUrl}
                                    alt="Issue"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                    {getCategoryEmoji(issue.category)}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 capitalize">
                                  {issue.category}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {issue.notes || 'No description'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {issue.location ? (
                              <div>
                                <div>{issue.location.latitude.toFixed(4)}</div>
                                <div>{issue.location.longitude.toFixed(4)}</div>
                              </div>
                            ) : (
                              'No location'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusBadge(issue.status)}>
                              {issue.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {issue.status === 'reported' && (
                              <button
                                onClick={() => updateIssueStatus(issue.id, 'in-progress')}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                Start Work
                              </button>
                            )}
                            {issue.status === 'in-progress' && (
                              <Link
                                href={`/admin/issues/${issue.id}/solve`}
                                className="text-green-600 hover:text-green-900"
                              >
                                Mark Solved
                              </Link>
                            )}
                            <Link
                              href={`/admin/issues/${issue.id}`}
                              className="text-civic-primary hover:text-civic-primary-dark"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  )
}