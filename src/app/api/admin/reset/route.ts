import { NextRequest, NextResponse } from 'next/server'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function DELETE(request: NextRequest) {
  try {
    console.log('Reset API: Starting to delete all issues from Firebase...')
    
    // Check if Firebase is properly initialized
    if (!db) {
      console.error('Firebase database not initialized')
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    // Get all issues from Firebase Firestore
    const issuesRef = collection(db, 'issues')
    const querySnapshot = await getDocs(issuesRef)
    
    console.log(`Reset API: Found ${querySnapshot.size} issues to delete`)
    
    // Delete all issues
    const deletePromises: Promise<void>[] = []
    querySnapshot.forEach((issueDoc) => {
      deletePromises.push(deleteDoc(doc(db, 'issues', issueDoc.id)))
    })
    
    // Execute all deletions
    await Promise.all(deletePromises)
    
    console.log(`Reset API: Successfully deleted ${querySnapshot.size} issues`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${querySnapshot.size} issues`,
      deletedCount: querySnapshot.size
    })
  } catch (error: any) {
    console.error('Reset API Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to reset issues database',
        details: error?.message
      },
      { status: 500 }
    )
  }
}