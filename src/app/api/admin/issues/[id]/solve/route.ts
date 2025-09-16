import { NextRequest, NextResponse } from 'next/server'
import { getIssueById, updateIssueWithSolution } from '@/lib/database'
import { verifyLocation } from '@/lib/ai-location-verification'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { solutionPhotoUrl, notes, originalIssue } = await request.json()
    const { id: issueId } = await params

    if (!solutionPhotoUrl || !issueId) {
      return NextResponse.json(
        { error: 'Missing solution photo URL or issue ID' },
        { status: 400 }
      )
    }

    console.log(`Processing solution for issue ${issueId}`)

    // Get the current issue from Supabase
    const issueData = await getIssueById(issueId)

    if (!issueData) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      )
    }

    // Verify location using AI
    console.log('Starting AI location verification...')
    const verificationResult = await verifyLocation(
      originalIssue.photoUrl || issueData.photo_url,
      solutionPhotoUrl,
      originalIssue.location || issueData.location
    )

    console.log('Verification result:', verificationResult)

    if (verificationResult.verified) {
      // Location verified - update issue status to solved
      await updateIssueWithSolution(issueId, solutionPhotoUrl, notes)

      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Issue marked as solved - location verified',
        confidence: verificationResult.confidence,
        details: verificationResult.details
      })
    } else {
      // Location verification failed
      return NextResponse.json({
        success: false,
        verified: false,
        message: verificationResult.message,
        confidence: verificationResult.confidence,
        details: verificationResult.details
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Error solving issue:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process solution',
        details: error?.message
      },
      { status: 500 }
    )
  }
}