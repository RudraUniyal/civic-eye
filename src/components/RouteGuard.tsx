'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  requireCivic?: boolean
}

export default function RouteGuard({ 
  children, 
  requireAuth = false, 
  requireAdmin = false, 
  requireCivic = false 
}: RouteGuardProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Still loading, wait

    if (requireAuth && !user) {
      router.push('/login')
      return
    }

    if (requireAdmin && (!userProfile || !userProfile.isActive || userProfile.role !== 'admin')) {
      router.push('/')
      return
    }

    if (requireCivic && (!userProfile || !userProfile.isActive || userProfile.role !== 'civic')) {
      router.push('/')
      return
    }
  }, [user, userProfile, loading, requireAuth, requireAdmin, requireCivic, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null // Will redirect
  }

  if (requireAdmin && (!userProfile || !userProfile.isActive || userProfile.role !== 'admin')) {
    return null // Will redirect
  }

  if (requireCivic && (!userProfile || !userProfile.isActive || userProfile.role !== 'civic')) {
    return null // Will redirect
  }

  return <>{children}</>
}