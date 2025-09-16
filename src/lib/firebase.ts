import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
}

// Validate Firebase configuration
function validateFirebaseConfig() {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig])
  
  if (missingKeys.length > 0) {
    console.warn('Missing Firebase configuration keys:', missingKeys)
    return false
  }
  return true
}

// Initialize Firebase only if configuration is valid
let app: any = null
let db: any = null
let storage: any = null
let auth: any = null

if (validateFirebaseConfig()) {
  try {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    storage = getStorage(app)
    auth = getAuth(app)
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
  }
} else {
  console.warn('Firebase not initialized due to missing configuration')
}

export { db, storage, auth }

export default app

export type Issue = {
  id: string
  photoUrl: string
  category: string
  notes: string | null
  status: string
  createdAt: Date
  location: {
    latitude: number
    longitude: number
  }
  userId?: string | null
}