'use client'

import { useState } from 'react'
import { getAllIssues } from '@/lib/database'

export default function TestFirebasePage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testFirebaseConnection = async () => {
    setLoading(true)
    try {
      console.log('Testing Supabase connection...')
      const issues = await getAllIssues()
      setResult({
        success: true,
        count: issues.length,
        issues: issues
      })
      console.log('Supabase test successful:', issues)
    } catch (error) {
      console.error('Supabase test failed:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testMapAPI = async () => {
    setLoading(true)
    try {
      console.log('Testing Map API...')
      const response = await fetch('/api/issues/map')
      const data = await response.json()
      setResult({
        success: response.ok,
        apiResult: data
      })
      console.log('Map API test result:', data)
    } catch (error) {
      console.error('Map API test failed:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
      
      <div className="space-y-4">
        <button
          onClick={testFirebaseConnection}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Supabase Direct Connection'}
        </button>
        
        <button
          onClick={testMapAPI}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
        >
          {loading ? 'Testing...' : 'Test Map API'}
        </button>
      </div>

      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Test Result:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}