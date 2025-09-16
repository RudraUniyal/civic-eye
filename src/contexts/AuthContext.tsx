'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { validateAdminSignup } from '@/lib/admin-authorization'

export type UserRole = 'admin' | 'civic'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: Date
  isActive: boolean
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>
  logout: () => Promise<void>
  isAdmin: () => boolean
  isCivic: () => boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user profile from Firestore
  const loadUserProfile = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setUserProfile({
          uid: user.uid,
          email: user.email!,
          displayName: data.displayName || user.displayName || '',
          role: data.role || 'civic',
          createdAt: data.createdAt?.toDate() || new Date(),
          isActive: data.isActive !== false
        })
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  // Create user profile in Firestore
  const createUserProfile = async (user: User, role: UserRole, displayName: string) => {
    try {
      const userProfile: Omit<UserProfile, 'uid'> = {
        email: user.email!,
        displayName,
        role,
        createdAt: new Date(),
        isActive: true
      }
      
      await setDoc(doc(db, 'users', user.uid), userProfile)
      setUserProfile({ uid: user.uid, ...userProfile })
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      await loadUserProfile(result.user)
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  // Sign up
  const signUp = async (email: string, password: string, displayName: string, role: UserRole) => {
    try {
      // Validate admin signup authorization
      validateAdminSignup(email, role)
      
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update the user's display name
      await updateProfile(result.user, { displayName })
      
      // Create user profile in Firestore
      await createUserProfile(result.user, role, displayName)
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  // Logout
  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // Role checks
  const isAdmin = () => userProfile?.role === 'admin' && userProfile?.isActive
  const isCivic = () => userProfile?.role === 'civic' && userProfile?.isActive

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(true)
      
      if (user) {
        await loadUserProfile(user)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
    isAdmin,
    isCivic
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}