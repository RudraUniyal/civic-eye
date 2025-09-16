'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import RouteGuard from '@/components/RouteGuard'
import { Issue } from '@/lib/firebase'
import { uploadSolutionPhoto } from '@/lib/database'

export default function SolveIssuePage() {
  const params = useParams()
  const router = useRouter()
  const issueId = params.id as string

  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [solutionPhoto, setSolutionPhoto] = useState<File | null>(null)
  const [solutionPhotoPreview, setSolutionPhotoPreview] = useState('')
  const [notes, setNotes] = useState('')
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSolutionPhoto(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setSolutionPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!solutionPhoto) {
      setError('Please upload a solution photo')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Upload solution photo to Supabase Storage
      const solutionPhotoUrl = await uploadSolutionPhoto(solutionPhoto, issueId)

      // Submit solution with AI verification
      const response = await fetch(`/api/admin/issues/${issueId}/solve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solutionPhotoUrl: solutionPhotoUrl,
          notes: notes.trim() || null,
          originalIssue: {
            photoUrl: issue?.photoUrl,
            location: issue?.location
          }
        }),
      })

      const result = await response.json()

      if (response.ok) {
        if (result.verified) {
          alert('Solution verified! Issue marked as solved.')
          router.push('/admin')
        } else {
          setError(`Location verification failed: ${result.message}. Please ensure the solution photo is taken at the same location as the original issue.`)
        }
      } else {
        throw new Error(result.error || 'Failed to submit solution')
      }
    } catch (error: any) {
      console.error('Error submitting solution:', error)
      setError(error.message || 'Failed to submit solution')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <RouteGuard requireAuth requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading issue...</p>
          </div>
        </div>
      </RouteGuard>
    )
  }

  if (error && !issue) {
    return (
      <RouteGuard requireAuth requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/admin')}
              className="bg-civic-primary text-white px-4 py-2 rounded-md hover:bg-civic-primary-dark"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard requireAuth requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button
              onClick={() => router.push('/admin')}
              className="text-civic-primary hover:text-civic-primary-dark mb-4"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Solve Issue</h1>
            <p className="text-gray-600">Upload solution photo and mark issue as resolved</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Original Issue */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Original Issue</h2>
              
              {issue && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="text-gray-900 capitalize">{issue.category}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900">{issue.notes || 'No description provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="text-gray-900">
                      {issue.location ? (
                        `${issue.location.latitude.toFixed(6)}, ${issue.location.longitude.toFixed(6)}`
                      ) : (
                        'No location data'
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reported Date</label>
                    <p className="text-gray-900">{new Date(issue.createdAt).toLocaleString()}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Original Photo</label>
                    {issue.photoUrl && issue.photoUrl !== 'no-photo' ? (
                      <img
                        src={issue.photoUrl}
                        alt="Original issue"
                        className="mt-2 w-full h-48 object-cover rounded-md border"
                      />
                    ) : (
                      <div className="mt-2 w-full h-48 bg-gray-200 rounded-md border flex items-center justify-center">
                        <span className="text-gray-500">No photo available</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Solution Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Solution Details</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="solutionPhoto" className="block text-sm font-medium text-gray-700 mb-2">
                    Solution Photo *
                  </label>
                  <input
                    id="solutionPhoto"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-primary focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a photo showing the solved issue. Location will be verified against the original issue.
                  </p>
                  
                  {solutionPhotoPreview && (
                    <div className="mt-3">
                      <img
                        src={solutionPhotoPreview}
                        alt="Solution preview"
                        className="w-full h-48 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Solution Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-primary focus:border-transparent"
                    placeholder="Describe how the issue was resolved..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying & Marking as Solved...
                    </div>
                  ) : (
                    'Mark as Solved'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  )
}