import { NextResponse } from 'next/server'
import { getAllIssues } from '@/lib/database'

export async function GET() {
  try {
    console.log('Map API: Fetching all issues...')
    
    // Use the Supabase database function
    const issues = await getAllIssues()
    
    console.log('Map API: Issues fetched:', issues.length)
    
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