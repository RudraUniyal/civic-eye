'use client'

import Link from 'next/link'

interface IssueCardProps {
  title: string
  description: string
  category: string
  backgroundImage: string
  href: string
}

export default function IssueCard({ 
  title, 
  description, 
  category, 
  backgroundImage, 
  href 
}: IssueCardProps) {
  return (
    <Link 
      href={href}
      className="card-container relative block w-full h-full focus:outline-none"
      aria-label={`Report ${title}`}
    >
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center transition-all duration-300"
          style={{ 
            backgroundImage: `url("${backgroundImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          onError={(e) => {
            console.log('Background image failed to load:', backgroundImage)
            // Fallback to a gradient if image fails
            e.currentTarget.style.background = 'linear-gradient(135deg, #ffd54f 0%, #ff9800 100%)'
          }}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="card-overlay" />

      {/* Content Panel */}
      <div className="card-content">
        <div className="space-y-4">
          <h3 className="text-3xl lg:text-4xl font-bold text-[#E9E1DA] leading-tight">
            {title}
          </h3>
          <p className="text-[#DBD1CD] text-base lg:text-lg leading-relaxed">
            {description}
          </p>
          <button 
            className="inline-flex items-center px-6 py-3 bg-[#0C0A0A] hover:bg-[#171514] text-[#E9E1DA] font-medium text-lg rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#9B9C9D] focus:ring-offset-2"
            onClick={(e) => {
              e.preventDefault()
              window.location.href = href
            }}
          >
            Report Issue
            <svg 
              className="ml-2 w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  )
}