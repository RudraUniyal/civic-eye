'use client'

import { useEffect, useRef, useState } from 'react'
import type { Issue } from '@/lib/firebase'

interface MapViewProps {
  category?: string
}

// Map component with Leaflet integration
export default function MapView({ category }: MapViewProps = {}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load issues from API
    const loadIssues = async () => {
      try {
        console.log('Loading issues from Firebase...')
        const response = await fetch('/api/issues/map')
        if (response.ok) {
          const result = await response.json()
          console.log('Issues loaded:', result)
          if (result.success && result.data && Array.isArray(result.data)) {
            setIssues(result.data)
          } else {
            setIssues([])
          }
        } else {
          console.error('Failed to load issues:', response.status)
        }
      } catch (error) {
        console.error('Error loading issues:', error)
        setIssues([])
      } finally {
        setLoading(false)
      }
    }

    loadIssues()
  }, [])

  useEffect(() => {
    let mounted = true

    const initializeMap = async () => {
      // Prevent multiple initializations
      if (mapInstanceRef.current || !mapRef.current || !mounted) {
        return
      }

      try {
        console.log('Initializing map...')
        
        // Dynamic import to avoid SSR issues
        const L = await import('leaflet')
        
        // Import CSS only once
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const cssLink = document.createElement('link')
          cssLink.rel = 'stylesheet'
          cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(cssLink)
          
          // Wait for CSS to load
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        if (!mapRef.current || !mounted) return

        // Fix for default markers in Leaflet
        try {
          if (L.Icon && L.Icon.Default && L.Icon.Default.prototype) {
            delete (L.Icon.Default.prototype as any)._getIconUrl
            L.Icon.Default.mergeOptions({
              iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            })
          }
        } catch (iconError) {
          console.warn('Could not configure Leaflet icons:', iconError)
        }

        // Create map instance with a more neutral starting location
        const map = L.map(mapRef.current, {
          preferCanvas: true
        }).setView([39.8283, -98.5795], 4) // Geographic center of US, zoomed out
        
        mapInstanceRef.current = map

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        // Add markers for issues
        const filteredIssues = category 
          ? issues.filter(issue => issue && issue.category === category)
          : issues.filter(issue => issue)
          
        console.log('Adding markers for issues:', filteredIssues)

        filteredIssues.forEach(issue => {
          try {
            if (issue.location && issue.location.latitude && issue.location.longitude) {
              const { latitude, longitude } = issue.location
              const marker = L.marker([latitude, longitude]).addTo(map)
              
              const categoryEmoji = {
                pothole: '🕳️',
                garbage: '🗑️',
                streetlight: '💡',
                graffiti: '🎨',
                other: '❓'
              }[issue.category] || '❓'
              
              const isBase64Photo = issue.photoUrl && issue.photoUrl.startsWith('data:')
              
              marker.bindPopup(`
                <div class="p-3 max-w-sm">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-lg">${categoryEmoji}</span>
                    <h3 class="font-bold capitalize">${issue.category}</h3>
                  </div>
                  ${isBase64Photo ? `<img src="${issue.photoUrl}" alt="Issue photo" class="w-full h-32 object-cover rounded mb-2">` : ''}
                  ${issue.notes ? `<p class="text-sm mb-2">${issue.notes}</p>` : ''}
                  <div class="text-xs text-gray-500">
                    <p>Status: <span class="capitalize">${issue.status}</span></p>
                    <p>Reported: ${new Date(issue.createdAt).toLocaleDateString()}</p>
                    <p>ID: ${issue.id}</p>
                  </div>
                </div>
              `)
            }
          } catch (markerError) {
            console.warn('Error creating marker:', markerError)
          }
        })

        // Get user location immediately and prioritize it
        if (navigator.geolocation) {
          // Show a message that we're getting location
          console.log('Getting your current location...')
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              try {
                const { latitude, longitude } = position.coords
                console.log('Location found:', latitude, longitude)
                
                // Center map on user location with appropriate zoom
                map.setView([latitude, longitude], 15)
                
                const userIcon = L.divIcon({
                  html: '<div style="background: #3B82F6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📍</div>',
                  className: 'user-location-marker',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                })
                
                L.marker([latitude, longitude], { icon: userIcon })
                  .addTo(map)
                  .bindPopup('<strong>Your Current Location</strong>')
                  .openPopup()
              } catch (locationError) {
                console.warn('Error processing user location:', locationError)
              }
            },
            (error) => {
              console.log('Could not get user location:', error.message)
              
              // Better fallback strategy
              if (filteredIssues.length > 0 && filteredIssues[0].location) {
                // Use first issue location as fallback
                const firstIssue = filteredIssues[0].location
                map.setView([firstIssue.latitude, firstIssue.longitude], 13)
                console.log('Using first issue location as fallback')
              } else {
                // Keep the neutral US center view but inform user
                console.log('No location available, showing general map view')
              }
              
              // Show user-friendly error message
              if (error.code === error.PERMISSION_DENIED) {
                console.log('Location access denied by user')
              } else if (error.code === error.POSITION_UNAVAILABLE) {
                console.log('Location information unavailable')
              } else if (error.code === error.TIMEOUT) {
                console.log('Location request timed out')
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 15000, // Increased timeout
              maximumAge: 300000
            }
          )
        } else {
          console.log('Geolocation not supported by this browser')
          // Fallback to first issue location if available
          if (filteredIssues.length > 0 && filteredIssues[0].location) {
            const firstIssue = filteredIssues[0].location
            map.setView([firstIssue.latitude, firstIssue.longitude], 13)
          }
        }

        if (mounted) {
          setMapLoaded(true)
        }
      } catch (error) {
        console.error('Error initializing map:', error)
        if (mounted) {
          setMapLoaded(false)
        }
      }
    }

    // Clean up existing map before initializing
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      } catch (cleanupError) {
        console.warn('Error cleaning up existing map:', cleanupError)
      }
    }

    if (!loading && issues && Array.isArray(issues)) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (mounted) {
          initializeMap()
        }
      }, 100)
      
      return () => {
        mounted = false
        clearTimeout(timer)
      }
    }

    return () => {
      mounted = false
    }
  }, [issues, loading, category])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        } catch (error) {
          console.warn('Error cleaning up map on unmount:', error)
        }
      }
    }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Community Issues Map</h3>
        <p className="text-sm text-gray-600">
          {loading ? 'Loading issues...' : `Showing ${issues.length} reported issue${issues.length === 1 ? '' : 's'}`}
        </p>
      </div>
      
      <div className="relative">
        <div
          ref={mapRef}
          id="map-container"
          className="h-96 w-full"
        />
        
        {(!mapLoaded || loading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">{loading ? 'Loading issues...' : 'Loading map...'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            🕳️ Potholes
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            🗑️ Garbage
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            💡 Street Lights
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            🎨 Graffiti
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ❓ Other
          </span>
        </div>
      </div>
    </div>
  )
}