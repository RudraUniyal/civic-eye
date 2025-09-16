import { NextResponse } from 'next/server'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET() {
  try {
    console.log('Map API: Fetching all issues from Firebase...')
    
    // Check if Firebase is properly initialized
    if (!db) {
      console.error('Firebase database not initialized')
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }
    
    // Get issues from Firebase Firestore
    const issuesRef = collection(db, 'issues')
    const q = query(issuesRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const issues: any[] = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      issues.push({
        id: doc.id,
        photoUrl: data.photoUrl,
        category: data.category,
        notes: data.notes,
        status: data.status,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        location: data.location
      })
    })
    
    console.log('Map API: Issues fetched from Firebase:', issues.length)
    
    return NextResponse.json({
      success: true,
      data: issues,
      count: issues.length
    })
  } catch (error: any) {
    console.error('Map API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch issues for map display',
        details: error?.message
      },
      { status: 500 }
    )
  }
}