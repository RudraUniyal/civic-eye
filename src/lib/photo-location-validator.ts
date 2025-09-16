// Photo Location Validation Utility
// Extracts GPS coordinates from photos and validates against current location

export interface PhotoLocationData {
  latitude: number
  longitude: number
  hasGPS: boolean
  timestamp?: Date
  accuracy?: number
}

export interface LocationValidationResult {
  isValid: boolean
  distance?: number
  message: string
  method: 'GPS' | 'Current' | 'None'
}

/**
 * Extract GPS coordinates from photo EXIF data
 */
export async function extractPhotoLocation(file: File): Promise<PhotoLocationData> {
  try {
    const exifr = await import('exifr')
    
    // Extract GPS coordinates
    const gps = await exifr.gps(file)
    
    // Extract additional EXIF data
    const exifData = await exifr.parse(file, {
      gps: true,
      exif: true
    })
    
    if (gps && gps.latitude && gps.longitude) {
      return {
        latitude: gps.latitude,
        longitude: gps.longitude,
        hasGPS: true,
        timestamp: exifData?.DateTime ? new Date(exifData.DateTime) : undefined,
        accuracy: exifData?.GPSHPositioningError || undefined
      }
    } else {
      return {
        latitude: 0,
        longitude: 0,
        hasGPS: false
      }
    }
  } catch (error) {
    console.log('Error extracting GPS from photo:', error)
    return {
      latitude: 0,
      longitude: 0,
      hasGPS: false
    }
  }
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in kilometers
}

/**
 * Validate photo location against current user location
 */
export function validatePhotoLocation(
  photoLocation: PhotoLocationData,
  currentLocation: { latitude: number; longitude: number }
): LocationValidationResult {
  if (!photoLocation.hasGPS) {
    return {
      isValid: true,
      message: 'No GPS data in photo - using current location',
      method: 'Current'
    }
  }

  const distance = calculateDistance(
    photoLocation.latitude,
    photoLocation.longitude,
    currentLocation.latitude,
    currentLocation.longitude
  )

  const distanceMeters = distance * 1000

  if (distanceMeters <= 50) {
    return {
      isValid: true,
      distance: distanceMeters,
      message: `Photo location verified (${Math.round(distanceMeters)}m from current location)`,
      method: 'GPS'
    }
  } else if (distanceMeters <= 200) {
    return {
      isValid: true,
      distance: distanceMeters,
      message: `Photo location acceptable (${Math.round(distanceMeters)}m from current location)`,
      method: 'GPS'
    }
  } else if (distanceMeters <= 1000) {
    return {
      isValid: false,
      distance: distanceMeters,
      message: `Warning: Photo taken ${Math.round(distanceMeters)}m away from current location`,
      method: 'GPS'
    }
  } else {
    return {
      isValid: false,
      distance: distanceMeters,
      message: `Photo location too far (${(distanceMeters / 1000).toFixed(1)}km away)`,
      method: 'GPS'
    }
  }
}

/**
 * Get current device location
 */
export function getCurrentLocation(): Promise<{ latitude: number; longitude: number; accuracy?: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  })
}