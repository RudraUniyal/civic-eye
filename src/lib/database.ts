import { supabase, type Issue } from './supabase'

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
 * Upload an issue photo to Supabase Storage
 */
export async function uploadIssuePhoto(file: File, issueId: string): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${issueId}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('issue-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Failed to upload photo: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('issue-photos')
    .getPublicUrl(fileName)

  return publicUrl
}

/**
 * Upload a solution photo to Supabase Storage
 */
export async function uploadSolutionPhoto(file: File, issueId: string): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `solutions/${issueId}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('issue-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true // Allow overwrite for solution photos
    })

  if (error) {
    throw new Error(`Failed to upload solution photo: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('issue-photos')
    .getPublicUrl(fileName)

  return publicUrl
}

/**
 * Submit a new issue report
 */
export async function submitIssue(submission: IssueSubmission): Promise<string> {
  try {
    // Generate UUID for the issue
    const issueId = crypto.randomUUID()
    
    // Upload photo first
    const photoUrl = await uploadIssuePhoto(submission.photo, issueId)
    
    // Create the issue record
    const { data, error } = await supabase
      .from('issues')
      .insert({
        id: issueId,
        photo_url: photoUrl,
        category: submission.category,
        notes: submission.notes || null,
        location: `ST_SetSRID(ST_MakePoint(${submission.longitude}, ${submission.latitude}), 4326)::geography`,
        status: 'reported'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create issue: ${error.message}`)
    }

    return issueId
  } catch (error) {
    console.error('Error submitting issue:', error)
    throw error
  }
}

/**
 * Get nearby issues within a specified radius
 */
export async function getNearbyIssues({ 
  latitude, 
  longitude, 
  radiusMeters = 1000 
}: NearbyIssuesParams): Promise<Issue[]> {
  try {
    const { data, error } = await supabase.rpc('get_nearby_issues', {
      center_lat: latitude,
      center_lng: longitude,
      radius_meters: radiusMeters
    })

    if (error) {
      throw new Error(`Failed to fetch nearby issues: ${error.message}`)
    }

    // Transform the data to match our Issue type
    return data.map((item: any) => ({
      id: item.id,
      photo_url: item.photo_url,
      category: item.category,
      notes: item.notes,
      status: item.status,
      created_at: item.created_at,
      location: {
        type: 'Point',
        coordinates: [item.longitude, item.latitude]
      }
    }))
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
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch issues: ${error.message}`)
    }

    // Transform to match Issue type
    return data.map((item: any) => ({
      id: item.id,
      photo_url: item.photo_url,
      category: item.category,
      notes: item.notes,
      status: item.status,
      created_at: item.created_at,
      location: item.location
    }))
  } catch (error) {
    console.error('Error fetching all issues:', error)
    throw error
  }
}

/**
 * Update issue with solution
 */
export async function updateIssueWithSolution(
  issueId: string, 
  solutionPhotoUrl: string, 
  notes?: string | null
): Promise<void> {
  const { error } = await supabase
    .from('issues')
    .update({
      status: 'solved',
      solution_photo: solutionPhotoUrl,
      solution_notes: notes,
      solved_at: new Date().toISOString()
    })
    .eq('id', issueId)

  if (error) {
    throw new Error(`Failed to update issue: ${error.message}`)
  }
}

/**
 * Update issue status
 */
export async function updateIssueStatus(
  issueId: string, 
  status: string
): Promise<void> {
  const { error } = await supabase
    .from('issues')
    .update({
      status: status
    })
    .eq('id', issueId)

  if (error) {
    throw new Error(`Failed to update issue status: ${error.message}`)
  }
}

/**
 * Get issue by ID
 */
export async function getIssueById(id: string): Promise<Issue | null> {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No rows found
      }
      throw new Error(`Failed to fetch issue: ${error.message}`)
    }

    return {
      id: data.id,
      photo_url: data.photo_url,
      category: data.category,
      notes: data.notes,
      status: data.status,
      created_at: data.created_at,
      location: data.location
    }
  } catch (error) {
    console.error('Error fetching issue by ID:', error)
    throw error
  }
}