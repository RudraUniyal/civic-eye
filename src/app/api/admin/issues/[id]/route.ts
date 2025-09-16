import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: issueId } = await params

    if (!issueId) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
        { status: 400 }
      )
    }

    // Get the issue from Firebase
    const issueRef = doc(db, 'issues', issueId)
    const issueSnap = await getDoc(issueRef)

    if (!issueSnap.exists()) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      )
    }

    const data = issueSnap.data()
    const issue = {
      id: issueSnap.id,
      photoUrl: data.photoUrl,
      category: data.category,
      notes: data.notes,
      status: data.status,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      location: data.location
    }

    return NextResponse.json({
      success: true,
      issue: issue
    })
  } catch (error: any) {
    console.error('Error fetching issue:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch issue',
        details: error?.message
      },
      { status: 500 }
    )
  }
}