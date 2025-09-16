'use client'

import { useState } from 'react'
import Link from 'next/link'
import IssueReportForm from '@/components/IssueReportForm'
import MapView from '@/components/MapView'

interface ReportPageLayoutProps {
  category: string
  title: string
  description: string
  defaultCategory: string
}

export default function ReportPageLayout({ 
  category, 
  title, 
  description, 
  defaultCategory 
}: ReportPageLayoutProps) {
  const [activeTab, setActiveTab] = useState<'report' | 'map'>('report')

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                aria-label="Go back to home"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Civic Eye</h1>
            </div>
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('report')}
                className={`px-4 py-2 rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  activeTab === 'report'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-current={activeTab === 'report' ? 'page' : undefined}
              >
                Report Issue
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-4 py-2 rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  activeTab === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-current={activeTab === 'map' ? 'page' : undefined}
              >
                View Map
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'report' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-lg text-gray-600">{description}</p>
            </div>
            <IssueReportForm defaultCategory={defaultCategory} />
          </div>
        )}
        
        {activeTab === 'map' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Issues Map</h2>
              <p className="text-lg text-gray-600">View reported {category} issues in your area</p>
            </div>
            <div id="map-container">
              <MapView category={category} />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}