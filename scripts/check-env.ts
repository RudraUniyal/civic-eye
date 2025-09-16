// Environment Variable Checker for Civic Eye
// Run this to verify all required environment variables are set

console.log('🔍 Checking Civic Eye Environment Variables...\n')

// Firebase Configuration
const firebaseVars = {
  'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID': process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Supabase Configuration
const supabaseVars = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

// Application Configuration
const appVars = {
  'NODE_ENV': process.env.NODE_ENV,
  'NEXT_PUBLIC_AUTHORIZED_ADMIN_EMAILS': process.env.NEXT_PUBLIC_AUTHORIZED_ADMIN_EMAILS
}

function checkVariables(category: string, vars: Record<string, string | undefined>) {
  console.log(`📋 ${category}:`)
  let allSet = true
  
  for (const [key, value] of Object.entries(vars)) {
    if (value && value.trim() !== '') {
      console.log(`  ✅ ${key}: ${value.length > 20 ? value.substring(0, 20) + '...' : value}`)
    } else {
      console.log(`  ❌ ${key}: NOT SET`)
      allSet = false
    }
  }
  
  console.log('')
  return allSet
}

const firebaseOk = checkVariables('Firebase Configuration', firebaseVars)
const supabaseOk = checkVariables('Supabase Configuration', supabaseVars)
const appOk = checkVariables('Application Configuration', appVars)

console.log('📊 Summary:')
console.log(`  Firebase: ${firebaseOk ? '✅ Ready' : '❌ Missing variables'}`)
console.log(`  Supabase: ${supabaseOk ? '✅ Ready' : '❌ Missing variables'}`)
console.log(`  App Config: ${appOk ? '✅ Ready' : '❌ Missing variables'}`)

if (firebaseOk && supabaseOk && appOk) {
  console.log('\n🎉 All environment variables are properly configured!')
  console.log('🚀 Your app should deploy successfully to Vercel.')
} else {
  console.log('\n⚠️  Some environment variables are missing.')
  console.log('📖 Check the VERCEL_DEPLOYMENT_GUIDE.md for setup instructions.')
}

export {}