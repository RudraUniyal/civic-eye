'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { classifyIssue, getCategoryInfo, type ClassificationResult } from '@/lib/ai-classification'

interface LocationData {
  latitude: number
  longitude: number
  accuracy?: number
}

const ISSUE_CATEGORIES = [
  { key: 'pothole', label: 'Pothole' },
  { key: 'garbage', label: 'Garbage/Litter' },
  { key: 'streetlight', label: 'Broken Street Light' },
  { key: 'graffiti', label: 'Graffiti' },
  { key: 'other', label: 'Other' }
]

interface IssueReportFormProps {
  defaultCategory?: string
}

export default function IssueReportForm({ defaultCategory = 'pothole' }: IssueReportFormProps = {}) {
  const { user, userProfile } = useAuth()
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [location, setLocation] = useState<LocationData | null>(null)
  const [category, setCategory] = useState(defaultCategory)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [reportId, setReportId] = useState<string>('')
  const [aiSuggestion, setAiSuggestion] = useState<ClassificationResult | null>(null)
  const [classifying, setClassifying] = useState(false)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setClassifying(true)

    // Try to extract GPS from EXIF data
    try {
      const exifr = await import('exifr')
      const gps = await exifr.gps(file)
      if (gps && gps.latitude && gps.longitude) {
        setLocation({
          latitude: gps.latitude,
          longitude: gps.longitude
        })
        console.log('GPS coordinates extracted from EXIF:', gps)
      }
    } catch (error) {
      console.log('No GPS data found in EXIF or error reading EXIF:', error)
    }

    // If no GPS in EXIF, try to get current location
    if (!location) {
      getCurrentLocation()
    }

    // Run AI classification
    try {
      const classification = await classifyIssue(file, notes)
      setAiSuggestion(classification)
      setCategory(classification.category)
    } catch (error) {
      console.error('Error classifying image:', error)
    } finally {
      setClassifying(false)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get location. Please enable location services.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!photo || !location) {
      alert('Please upload a photo and ensure location is available.')
      return
    }

    if (!user) {
      alert('Please log in to submit an issue.')
      return
    }

    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('photo', photo)
      formData.append('latitude', location.latitude.toString())
      formData.append('longitude', location.longitude.toString())
      formData.append('category', category)
      formData.append('notes', notes)
      formData.append('userId', user.uid)
      formData.append('userEmail', user.email || '')

      const response = await fetch('/api/issues', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to submit issue')
      }

      const result = await response.json()
      setReportId(result.id)
      alert(`Issue reported successfully! Report ID: ${result.id}`)
      
      // Reset form
      setPhoto(null)
      setPhotoPreview('')
      setLocation(null)
      setCategory('pothole')
      setNotes('')
      
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Error submitting report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {!user ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
          <p className="text-gray-600 mb-6">
            Please log in to report issues and help improve your community.
          </p>
          <div className="space-x-4">
            <a
              href="/login"
              className="bg-civic-primary text-white px-6 py-2 rounded-md hover:bg-civic-primary-dark transition-colors"
            >
              Login
            </a>
            <a
              href="/signup"
              className="border border-civic-primary text-civic-primary px-6 py-2 rounded-md hover:bg-civic-primary hover:text-white transition-colors"
            >
              Sign Up
            </a>
          </div>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Photo *
          </label>
          <input
            type="file"
            id="photo"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            required
          />
          {photoPreview && (
            <div className="mt-4">
              <img
                src={photoPreview}
                alt="Issue preview"
                className="max-w-full h-64 object-cover rounded-md"
              />
            </div>
          )}
        </div>

        {/* Location Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location Status
          </label>
          <div className="p-3 bg-gray-50 rounded-md">
            {location ? (
              <div className="text-green-600">
                ✓ Location captured: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                {location.accuracy && ` (±${Math.round(location.accuracy)}m)`}
              </div>
            ) : (
              <div className="text-orange-600">
                ⚠ Location not available
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="ml-2 text-blue-600 underline hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Get Location
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Category Selection with AI Suggestion */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Issue Category *
          </label>
          
          {aiSuggestion && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2 text-blue-700">
                <span className="text-lg">{getCategoryInfo(aiSuggestion.category).emoji}</span>
                <span className="font-medium">AI Suggestion:</span>
                <span>{getCategoryInfo(aiSuggestion.category).label}</span>
                <span className="text-sm">({Math.round(aiSuggestion.confidence * 100)}% confidence)</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">{aiSuggestion.reasoning}</p>
            </div>
          )}
          
          {classifying && (
            <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Analyzing image for category suggestion...</span>
              </div>
            </div>
          )}
          
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {ISSUE_CATEGORIES.map((cat) => {
              const info = getCategoryInfo(cat.key)
              return (
                <option key={cat.key} value={cat.key}>
                  {info.emoji} {info.label}
                </option>
              )
            })}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {aiSuggestion ? 'AI suggested category (you can change it)' : 'Select the most appropriate category'}
          </p>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the issue in more detail..."
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading || !photo || !location}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Report Issue'}
          </button>
        </div>

        {reportId && (
          <div className="p-4 bg-green-50 rounded-md">
            <p className="text-green-800">
              <strong>Success!</strong> Your report ID is: <code className="bg-green-100 px-2 py-1 rounded">{reportId}</code>
            </p>
          </div>
        )}
      </form>
      )}
    </div>
  )
}