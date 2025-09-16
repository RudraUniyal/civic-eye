import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Issue = {
  id: string
  photo_url: string
  category: string
  notes: string | null
  status: string
  created_at: string
  location: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  user_id?: string | null
  solution_photo?: string | null
  solution_notes?: string | null
  solved_at?: string | null
}