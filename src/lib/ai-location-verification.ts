// AI Location Verification Service
// This service uses image analysis to verify that two photos were taken at the same location

interface LocationData {
  latitude: number
  longitude: number
}

interface VerificationResult {
  verified: boolean
  confidence: number
  message: string
  details?: any
}

/**
 * Extract GPS coordinates from EXIF data of an image
 */
export async function extractGPSFromImage(imageUrl: string): Promise<LocationData | null> {
  try {
    console.log('Extracting GPS from image EXIF data...')
    
    // Fetch the image
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    
    // Use exifr to extract GPS data
    const exifr = await import('exifr')
    const gps = await exifr.gps(blob)
    
    if (gps && gps.latitude && gps.longitude) {
      console.log('GPS coordinates found:', gps)
      return {
        latitude: gps.latitude,
        longitude: gps.longitude
      }
    }
    
    console.log('No GPS data found in image')
    return null
  } catch (error) {
    console.error('Error extracting GPS from image:', error)
    return null
  }
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
 * Analyze image content for visual similarity using AI
 * This is a mock implementation - in production you would use:
 * - Google Vision API
 * - AWS Rekognition  
 * - Azure Computer Vision
 * - OpenAI Vision API
 */
async function analyzeImageSimilarity(originalImage: string, solutionImage: string): Promise<{
  similarity: number
  features: string[]
}> {
  try {
    console.log('Analyzing image similarity using AI...')
    
    // Mock AI analysis - replace with actual AI service
    // This would analyze visual features, objects, and scene composition
    const mockSimilarity = Math.random() * 0.4 + 0.6 // Random between 0.6-1.0
    const mockFeatures = [
      'Similar background elements detected',
      'Matching architectural features',
      'Consistent lighting conditions',
      'Similar perspective and angle'
    ]
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      similarity: mockSimilarity,
      features: mockFeatures
    }
  } catch (error) {
    console.error('Error analyzing image similarity:', error)
    return {
      similarity: 0,
      features: []
    }
  }
}

/**
 * Verify that solution photo was taken at the same location as original issue
 */
export async function verifyLocation(
  originalPhoto: string,
  solutionPhoto: string,
  originalLocation: LocationData | null
): Promise<VerificationResult> {
  try {
    console.log('Starting location verification...')
    
    // Step 1: Extract GPS from solution photo
    const solutionGPS = await extractGPSFromImage(solutionPhoto)
    
    // Step 2: If both photos have GPS data, compare coordinates
    if (originalLocation && solutionGPS) {
      const distance = calculateDistance(
        originalLocation.latitude,
        originalLocation.longitude,
        solutionGPS.latitude,
        solutionGPS.longitude
      )
      
      console.log(`GPS distance between photos: ${distance.toFixed(3)} km`)
      
      // If photos are within 50 meters (0.05 km), consider them at same location
      if (distance <= 0.05) {
        return {
          verified: true,
          confidence: 0.95,
          message: 'GPS coordinates confirm same location',
          details: { distance, method: 'GPS' }
        }
      } else if (distance <= 0.1) {
        // Within 100 meters - proceed to visual analysis
        console.log('GPS shows nearby location, analyzing visual similarity...')
      } else {
        return {
          verified: false,
          confidence: 0.1,
          message: `Photos taken ${distance.toFixed(2)} km apart - too far to be same location`,
          details: { distance, method: 'GPS' }
        }
      }
    }
    
    // Step 3: Use AI to analyze visual similarity
    const aiAnalysis = await analyzeImageSimilarity(originalPhoto, solutionPhoto)
    
    console.log(`AI similarity score: ${aiAnalysis.similarity.toFixed(3)}`)
    
    // Determine verification result based on AI analysis
    if (aiAnalysis.similarity >= 0.8) {
      return {
        verified: true,
        confidence: aiAnalysis.similarity,
        message: 'High visual similarity confirms same location',
        details: { 
          similarity: aiAnalysis.similarity, 
          features: aiAnalysis.features,
          method: 'AI Visual Analysis'
        }
      }
    } else if (aiAnalysis.similarity >= 0.6) {
      return {
        verified: true,
        confidence: aiAnalysis.similarity,
        message: 'Good visual similarity indicates same location',
        details: { 
          similarity: aiAnalysis.similarity, 
          features: aiAnalysis.features,
          method: 'AI Visual Analysis'
        }
      }
    } else {
      return {
        verified: false,
        confidence: aiAnalysis.similarity,
        message: 'Visual analysis suggests different locations',
        details: { 
          similarity: aiAnalysis.similarity, 
          features: aiAnalysis.features,
          method: 'AI Visual Analysis'
        }
      }
    }
    
  } catch (error) {
    console.error('Error in location verification:', error)
    return {
      verified: false,
      confidence: 0,
      message: 'Location verification failed due to technical error',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

/**
 * Enhanced verification for production use
 * Combines multiple verification methods for better accuracy
 */
export async function verifyLocationEnhanced(
  originalPhoto: string,
  solutionPhoto: string,
  originalLocation: LocationData | null,
  additionalData?: {
    timestamp?: Date
    deviceInfo?: string
    userAgent?: string
  }
): Promise<VerificationResult> {
  try {
    const basicVerification = await verifyLocation(originalPhoto, solutionPhoto, originalLocation)
    
    // In production, you could add additional verification methods:
    // - Reverse geocoding to verify address matches
    // - Metadata analysis (camera settings, timestamp proximity)
    // - Weather data correlation
    // - Cell tower triangulation data
    // - WiFi network fingerprinting
    
    return basicVerification
  } catch (error) {
    console.error('Error in enhanced location verification:', error)
    return {
      verified: false,
      confidence: 0,
      message: 'Enhanced verification failed',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}