# Vercel Deployment Guide for Civic Eye

This guide will help you successfully deploy your Civic Eye application to Vercel.

## The Error You're Facing

Your deployment is failing with:
```
Error [FirebaseError]: Firebase: Error (auth/invalid-api-key)
```

This happens because Vercel doesn't have access to your Firebase environment variables during the build process.

## Quick Fix: Configure Environment Variables in Vercel

### Step 1: Access Your Vercel Project Settings

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your `civic-eye` project
3. Click on the **Settings** tab
4. Click on **Environment Variables** in the sidebar

### Step 2: Add All Required Environment Variables

Add the following environment variables **exactly as shown**:

#### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDsCDx6a_SOJiWt70VevbYqkkr_aozaANU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=civic-eye-ca836.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=civic-eye-ca836
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=civic-eye-ca836.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1097165335081
NEXT_PUBLIC_FIREBASE_APP_ID=1:1097165335081:web:4ce4172adfb2e637ad4a38
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-BYTLBTFW8Z
```

#### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://ndpvkorzcfvqryybujtq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcHZrb3J6Y2Z2cXJ5eWJ1anRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODgyMjAsImV4cCI6MjA3MzE2NDIyMH0.bsozefYAFEPDOH6Lmr3vTqfPfB0q9IW1Wl6FMJzsLAs
```

#### Application Configuration
```
NODE_ENV=production
NEXT_PUBLIC_AUTHORIZED_ADMIN_EMAILS=rudrauniyal7@gmail.com
```

### Step 3: Set Environment for All Environments

For each environment variable:
1. Enter the **Name** (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`)
2. Enter the **Value** (e.g., `AIzaSyDsCDx6a_SOJiWt70VevbYqkkr_aozaANU`)
3. Check all environments: **Production**, **Preview**, and **Development**
4. Click **Save**

### Step 4: Redeploy Your Application

1. Go to the **Deployments** tab in your Vercel project
2. Click the **three dots** next to your latest deployment
3. Click **Redeploy**

## What We Fixed in the Code

I've also updated your Firebase initialization code to handle missing environment variables gracefully:

1. **Firebase Configuration**: Now provides fallback empty strings instead of throwing errors
2. **Validation Function**: Checks if all required Firebase config keys are present
3. **Graceful Initialization**: Only initializes Firebase if configuration is valid
4. **API Route Protection**: All API routes now check if Firebase is properly initialized

## Verification Steps

After redeployment, your app should:

1. ✅ Build successfully without Firebase errors
2. ✅ Deploy to Vercel without issues
3. ✅ Load the homepage correctly
4. ✅ Allow user authentication (if Firebase is properly configured)
5. ✅ Allow issue submission (if both Firebase and Supabase are configured)

## Security Notes

- ✅ All Firebase config values are safe to expose (they're public by design)
- ✅ The `NEXT_PUBLIC_` prefix makes them available to the client-side code
- ✅ Supabase anon key is also safe to expose (it's public and has restricted permissions)

## Troubleshooting

### If deployment still fails:

1. **Double-check environment variable names** - they must match exactly
2. **Check for extra spaces** in values
3. **Ensure all environments are selected** (Production, Preview, Development)
4. **Try a fresh deployment** instead of redeploy

### If the app loads but features don't work:

1. **Firebase features** (auth, database) won't work if Firebase env vars are missing
2. **Supabase features** (storage) won't work if Supabase env vars are missing
3. **Check browser console** for any client-side errors
4. **Check Vercel function logs** for server-side errors

## Next Steps After Successful Deployment

1. Test user registration and login
2. Test issue submission with photo upload
3. Test admin dashboard functionality
4. Monitor Vercel function logs for any runtime errors

---

**Need Help?** Check the Vercel deployment logs in your project dashboard for specific error messages.