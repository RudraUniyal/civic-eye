'use client'

import { useAuth } from '@/contexts/AuthContext'
import MapView from '@/components/MapView'
import CivicEyeLogo from '@/components/CivicEyeLogo'

export default function MapPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-civic-gray-bg via-civic-cream to-civic-sand">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-civic-gray-lighter/30 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a 
                href="/" 
                className="flex items-center gap-2 text-civic-slate hover:text-civic-primary transition-colors duration-300"
              >
                <CivicEyeLogo size="sm" />
              </a>
              <div className="h-6 w-px bg-civic-gray-lighter"></div>
              <h1 className="text-2xl font-bold text-civic-slate">Community Issues Map</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <a 
                    href="/report" 
                    className="bg-civic-primary text-white px-4 py-2 rounded-lg hover:bg-civic-primary-dark transition-colors duration-300 font-medium"
                  >
                    Report Issue
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <a 
                    href="/login" 
                    className="text-civic-gray hover:text-civic-slate transition-colors duration-300"
                  >
                    Login
                  </a>
                  <a 
                    href="/signup" 
                    className="bg-civic-primary text-white px-4 py-2 rounded-lg hover:bg-civic-primary-dark transition-colors duration-300"
                  >
                    Sign Up
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-lg text-civic-gray max-w-3xl">
              Explore all reported issues in your community. Click on any marker to see details, photos, and current status.
            </p>
          </div>
          
          {/* Full-width Map */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative" style={{height: '600px', position: 'relative'}}>
            <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}>
              <MapView height="h-full" showHeader={false} />
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-civic-slate mb-4">Issue Types</h3>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                🕳️ Potholes
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                🗑️ Garbage
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                💡 Street Lights
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                🎨 Graffiti
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                ❓ Other
              </span>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/report" 
              className="inline-flex items-center justify-center gap-2 bg-civic-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-civic-primary-dark transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <span>📷</span>
              <span>Report New Issue</span>
            </a>
            <a 
              href="/" 
              className="inline-flex items-center justify-center gap-2 border-2 border-civic-primary text-civic-primary px-6 py-3 rounded-xl font-semibold hover:bg-civic-primary hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              <span>🏠</span>
              <span>Back to Home</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}