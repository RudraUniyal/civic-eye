'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import CivicEyeLogo from './CivicEyeLogo'

export default function InteractiveNav() {
  const [activeSection, setActiveSection] = useState('home')
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, userProfile, logout, isAdmin } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)

      // Update active section based on scroll position
      const sections = ['home', 'how-it-works', 'report']
      const currentSection = sections.find(section => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })
      
      if (currentSection) {
        setActiveSection(currentSection)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const elementPosition = element.offsetTop
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <nav 
      className={`relative z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#F1F2F4]/85 backdrop-blur-lg border-b border-[#C2C4C8] shadow-lg' 
          : 'bg-transparent backdrop-blur-sm border-b border-[#C2C4C8]/50 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <CivicEyeLogo size="md" />
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {[
              { id: 'home', label: 'Home' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'report', label: 'Report Issues' }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`relative px-3 py-2 font-medium transition-all duration-300 hover:text-[#0C0A0A] group ${
                  activeSection === id ? 'text-[#0C0A0A]' : 'text-[#9B9C9D]'
                }`}
              >
                {label}
                <span 
                  className="absolute bottom-0 left-0 h-0.5 bg-[#0C0A0A] transition-all duration-300 w-0 group-hover:w-full"
                />
              </button>
            ))}
            
            {/* Authentication Section */}
            {user ? (
              <div className="flex items-center space-x-4">
                {isAdmin() && (
                  <Link
                    href="/admin"
                    className="relative text-[#9B9C9D] hover:text-[#0C0A0A] font-medium transition-colors duration-300 group"
                  >
                    Admin Dashboard
                    <span className="absolute bottom-0 left-0 h-0.5 bg-[#0C0A0A] transition-all duration-300 w-0 group-hover:w-full" />
                  </Link>
                )}
                <span className="text-sm text-[#9B9C9D]">
                  {userProfile?.displayName || user.email}
                </span>
                <button
                  onClick={() => logout()}
                  className="relative text-[#9B9C9D] hover:text-[#0C0A0A] font-medium transition-colors duration-300 group"
                >
                  Logout
                  <span className="absolute bottom-0 left-0 h-0.5 bg-[#0C0A0A] transition-all duration-300 w-0 group-hover:w-full" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-[#9B9C9D] hover:text-[#0C0A0A] font-medium transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-[#0C0A0A] hover:bg-[#171514] text-[#E9E1DA] px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#9B9C9D] focus:ring-offset-2 transform hover:scale-105 hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-[#9B9C9D] hover:text-[#0C0A0A] focus:outline-none focus:ring-2 focus:ring-[#9B9C9D] rounded-md p-2 transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}