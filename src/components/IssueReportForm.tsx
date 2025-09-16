'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { extractPhotoLocation, validatePhotoLocation, getCurrentLocation, type PhotoLocationData, type LocationValidationResult } from '@/lib/photo-location-validator'

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
  const [photoMetadata, setPhotoMetadata] = useState<PhotoLocationData | null>(null)
  const [category, setCategory] = useState(defaultCategory)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [reportId, setReportId] = useState<string>('')
  const [locationValidation, setLocationValidation] = useState<LocationValidationResult | null>(null)

  // Simple category display helper
  const getCategoryDisplay = (key: string) => {
    const categories = {
      pothole: { emoji: '🕳️', label: 'Pothole' },
      garbage: { emoji: '🗑️', label: 'Garbage/Litter' },
      streetlight: { emoji: '💡', label: 'Broken Street Light' },
      graffiti: { emoji: '🎨', label: 'Graffiti' },
      other: { emoji: '❓', label: 'Other' }
    }
    return categories[key as keyof typeof categories] || categories.other
  }

  // Auto-locate user when component mounts
  useEffect(() => {
    getLocation()
  }, [])

  const getLocation = () => {
    if (navigator.geolocation) {
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
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))

    // Extract GPS from photo EXIF data
    const photoLocation = await extractPhotoLocation(file)
    setPhotoMetadata(photoLocation)

    // If we have current location, validate against photo location
    if (location && photoLocation.hasGPS) {
      const validation = validatePhotoLocation(photoLocation, location)
      setLocationValidation(validation)
    }
    
    // Use photo GPS as primary location if no current location and photo has GPS
    if (!location && photoLocation.hasGPS) {
      setLocation({
        latitude: photoLocation.latitude,
        longitude: photoLocation.longitude
      })
    }

    // If no GPS in photo and no current location, try to get current location
    if (!location && !photoLocation.hasGPS) {
      getLocation()
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

        {/* Location Display with Validation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="space-y-2">
            {location ? (
              <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
                ✓ Current Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                {location.accuracy && (
                  <span className="block text-xs text-green-600">
                    Accuracy: ±{Math.round(location.accuracy)}m
                  </span>
                )}
              </div>
            ) : (
              <div className="text-sm text-orange-700 bg-orange-50 p-2 rounded">
                ⚠ Location not available
                <button
                  type="button"
                  onClick={getLocation}
                  className="ml-2 text-blue-600 underline hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Get Location
                </button>
              </div>
            )}
            
            {/* Photo Location Validation */}
            {photoMetadata?.hasGPS && (
              <div className="text-sm p-2 rounded border bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">📷 Photo GPS:</span>
                  <span>{photoMetadata.latitude?.toFixed(6)}, {photoMetadata.longitude?.toFixed(6)}</span>
                </div>
                {photoMetadata.timestamp && (
                  <div className="text-xs text-gray-600">
                    Photo taken: {photoMetadata.timestamp.toLocaleString()}
                  </div>
                )}
              </div>
            )}
            
            {/* Location Validation Result */}
            {locationValidation && (
              <div className={`text-sm p-2 rounded border ${
                locationValidation.isValid 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-yellow-50 text-yellow-700 border-yellow-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span>{locationValidation.isValid ? '✅' : '⚠️'}</span>
                  <span>{locationValidation.message}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Issue Category *
          </label>
          
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {ISSUE_CATEGORIES.map((cat) => {
              const info = getCategoryDisplay(cat.key)
              return (
                <option key={cat.key} value={cat.key}>
                  {info.emoji} {info.label}
                </option>
              )
            })}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Select the most appropriate category for this issue
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