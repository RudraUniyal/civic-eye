'use client'

import { useState } from 'react'
import { useAuth, UserRole } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAuthorizedAdminEmail } from '@/lib/admin-authorization'
import CivicEyeLogo from '@/components/CivicEyeLogo'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<UserRole>('civic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [adminWarning, setAdminWarning] = useState('')
  
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  // Check admin authorization when role or email changes
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole)
    setAdminWarning('')
    
    if (newRole === 'admin' && email && !isAuthorizedAdminEmail(email)) {
      setAdminWarning(`The email "${email}" is not authorized for admin access. Please use an authorized email address.`)
    }
  }

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail)
    setAdminWarning('')
    
    if (role === 'admin' && newEmail && !isAuthorizedAdminEmail(newEmail)) {
      setAdminWarning(`The email "${newEmail}" is not authorized for admin access. Please use an authorized email address.`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        await signIn(email, password)
        router.push('/')
      } else {
        if (!displayName.trim()) {
          throw new Error('Display name is required')
        }
        await signUp(email, password, displayName, role)
        router.push('/')
      }
    } catch (error: any) {
      console.error('Authentication error:', error)
      setError(error.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-civic-primary via-civic-accent-blue to-civic-accent-purple flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-6">
          <CivicEyeLogo size="lg" className="justify-center" />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Join Civic Eye'}
          </h1>
          <p className="text-gray-600">
            {mode === 'login' 
              ? 'Sign in to your account' 
              : 'Create your account to start reporting issues'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {adminWarning && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md text-sm">
              <div className="flex items-start">
                <span className="text-amber-500 mr-2">⚠️</span>
                <div>
                  <strong>Admin Access Restricted:</strong>
                  <br />
                  {adminWarning}
                </div>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-primary focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-primary focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-civic-primary focus:border-transparent"
              placeholder="Enter your password"
              minLength={6}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="civic"
                    type="radio"
                    name="role"
                    value="civic"
                    checked={role === 'civic'}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="h-4 w-4 text-civic-primary focus:ring-civic-primary border-gray-300"
                  />
                  <label htmlFor="civic" className="ml-3 block text-sm text-gray-700">
                    <span className="font-medium">Civic User</span>
                    <span className="text-gray-500 block text-xs">Report and track community issues</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="admin"
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    disabled={email ? !isAuthorizedAdminEmail(email) : false}
                    className="h-4 w-4 text-civic-primary focus:ring-civic-primary border-gray-300"
                  />
                  <label htmlFor="admin" className="ml-3 block text-sm text-gray-700">
                    <span className="font-medium">Administrator</span>
                    <span className="text-gray-500 block text-xs">Manage and resolve community issues</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-civic-primary text-white py-2 px-4 rounded-md hover:bg-civic-primary-dark focus:outline-none focus:ring-2 focus:ring-civic-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            {' '}
            <Link 
              href={mode === 'login' ? '/signup' : '/login'}
              className="text-civic-primary hover:text-civic-primary-dark font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}