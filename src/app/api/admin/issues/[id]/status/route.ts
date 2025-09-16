import { NextRequest, NextResponse } from 'next/server'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json()
    const { id: issueId } = await params

    if (!status || !issueId) {
      return NextResponse.json(
        { error: 'Missing status or issue ID' },
        { status: 400 }
      )
    }

    // Valid status values
    const validStatuses = ['reported', 'in-progress', 'solved']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Update the issue status in Firebase
    const issueRef = doc(db, 'issues', issueId)
    await updateDoc(issueRef, {
      status: status,
      updatedAt: new Date()
    })

    console.log(`Issue ${issueId} status updated to: ${status}`)

    return NextResponse.json({
      success: true,
      message: `Issue status updated to ${status}`
    })
  } catch (error: any) {
    console.error('Error updating issue status:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update issue status',
        details: error?.message
      },
      { status: 500 }
    )
  }
}