import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage'
import { db, storage, type Issue } from './firebase'

export interface IssueSubmission {
  photo: File
  latitude: number
  longitude: number
  category: string
  notes?: string
}

export interface NearbyIssuesParams {
  latitude: number
  longitude: number
  radiusMeters?: number
}

/**
 * Upload an issue photo to Firebase Storage
 */
export async function uploadIssuePhoto(file: File, issueId: string): Promise<string> {
  try {
    console.log('Starting photo upload...', { fileName: file.name, fileSize: file.size, issueId })
    
    const fileExt = file.name.split('.').pop()
    const fileName = `issues/${issueId}.${fileExt}`
    
    console.log('Storage path:', fileName)
    
    const storageRef = ref(storage, fileName)
    console.log('Storage ref created')
    
    const snapshot = await uploadBytes(storageRef, file)
    console.log('Upload completed:', snapshot.metadata)
    
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log('Download URL obtained:', downloadURL)
    
    return downloadURL
  } catch (error: any) {
    console.error('Detailed upload error:', {
      error,
      errorCode: error?.code,
      errorMessage: error?.message,
      storageConfig: {
        bucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      }
    })
    throw new Error(`Failed to upload photo: ${error?.message || error}`)
  }
}

/**
 * Submit a new issue report
 */
export async function submitIssue(submission: IssueSubmission): Promise<string> {
  try {
    // Generate a temporary ID for the issue
    const tempId = crypto.randomUUID()
    
    // Upload photo first
    const photoUrl = await uploadIssuePhoto(submission.photo, tempId)
    
    // Create the issue document
    const issueData = {
      photoUrl,
      category: submission.category,
      notes: submission.notes || null,
      status: 'reported',
      createdAt: Timestamp.now(),
      location: {
        latitude: submission.latitude,
        longitude: submission.longitude
      }
    }

    const docRef = await addDoc(collection(db, 'issues'), issueData)
    
    return docRef.id
  } catch (error) {
    console.error('Error submitting issue:', error)
    throw error
  }
}

/**
 * Get nearby issues within a specified radius
 * Note: Firebase doesn't have built-in geospatial queries like PostGIS
 * This is a simplified version that gets all issues and filters client-side
 */
export async function getNearbyIssues({ 
  latitude, 
  longitude, 
  radiusMeters = 1000 
}: NearbyIssuesParams): Promise<Issue[]> {
  try {
    const issuesRef = collection(db, 'issues')
    const q = query(issuesRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const issues: Issue[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      
      // Calculate distance using Haversine formula
      const distance = calculateDistance(
        latitude,
        longitude,
        data.location.latitude,
        data.location.longitude
      )
      
      // Filter by radius
      if (distance <= radiusMeters) {
        issues.push({
          id: doc.id,
          photoUrl: data.photoUrl,
          category: data.category,
          notes: data.notes,
          status: data.status,
          createdAt: data.createdAt.toDate(),
          location: data.location
        })
      }
    })
    
    return issues
  } catch (error) {
    console.error('Error fetching nearby issues:', error)
    throw error
  }
}

/**
 * Get all issues (for map display)
 */
export async function getAllIssues(): Promise<Issue[]> {
  try {
    const issuesRef = collection(db, 'issues')
    const q = query(issuesRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const issues: Issue[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      issues.push({
        id: doc.id,
        photoUrl: data.photoUrl,
        category: data.category,
        notes: data.notes,
        status: data.status,
        createdAt: data.createdAt.toDate(),
        location: data.location
      })
    })
    
    return issues
  } catch (error) {
    console.error('Error fetching all issues:', error)
    throw error
  }
}

/**
 * Get issue by ID
 */
export async function getIssueById(id: string): Promise<Issue | null> {
  try {
    const docRef = doc(db, 'issues', id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        photoUrl: data.photoUrl,
        category: data.category,
        notes: data.notes,
        status: data.status,
        createdAt: data.createdAt.toDate(),
        location: data.location
      }
    } else {
      return null
    }
  } catch (error) {
    console.error('Error fetching issue by ID:', error)
    throw error
  }
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180
  const φ2 = lat2 * Math.PI/180
  const Δφ = (lat2-lat1) * Math.PI/180
  const Δλ = (lon2-lon1) * Math.PI/180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c // Distance in meters
}