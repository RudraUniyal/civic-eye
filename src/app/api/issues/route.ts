import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { addDoc, collection, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Upload photo to Supabase Storage
async function uploadPhotoToSupabase(file: File, issueId: string): Promise<string> {
  console.log('🔄 Starting Supabase upload...', { fileName: file.name, fileSize: file.size, issueId })
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${issueId}.${fileExt}`
  
  console.log('📤 Uploading to bucket: issue-photos, file:', fileName)
  
  const { data, error } = await supabase.storage
    .from('issue-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('❌ Supabase Storage Error:', error)
    throw new Error(`Failed to upload photo: ${error.message}`)
  }

  console.log('✅ Upload successful:', data)
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('issue-photos')
    .getPublicUrl(fileName)

  console.log('🔗 Public URL generated:', publicUrl)
  return publicUrl
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Starting issue submission...')
    const formData = await request.formData()
    
    const photo = formData.get('photo') as File
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)
    const category = formData.get('category') as string
    const notes = formData.get('notes') as string
    const userId = formData.get('userId') as string
    const userEmail = formData.get('userEmail') as string

    console.log('📋 Form data received:', { 
      hasPhoto: !!photo, 
      photoName: photo?.name, 
      latitude, 
      longitude, 
      category 
    })

    if (!photo || !latitude || !longitude || !category) {
      console.log('⚠️ Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate issue ID
    const issueId = crypto.randomUUID()
    console.log('🆔 Generated issue ID:', issueId)
    
    // Upload photo to Supabase Storage
    console.log('📤 Starting photo upload to Supabase...')
    const photoUrl = await uploadPhotoToSupabase(photo, issueId)
    console.log('✅ Photo uploaded successfully:', photoUrl)
    
    // Save issue to Firebase Database
    console.log('💾 Saving to Firebase...')
    const issueData = {
      photoUrl,
      category,
      notes: notes || null,
      status: 'reported',
      createdAt: Timestamp.now(),
      location: {
        latitude,
        longitude
      },
      userId: userId || null,
      userEmail: userEmail || null
    }

    const docRef = await addDoc(collection(db, 'issues'), issueData)
    console.log('✅ Firebase save successful:', docRef.id)

    return NextResponse.json({ 
      id: docRef.id, 
      success: true,
      message: 'Issue submitted successfully with Supabase Storage'
    })
  } catch (error) {
    console.error('💥 API Error:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to submit issue',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}