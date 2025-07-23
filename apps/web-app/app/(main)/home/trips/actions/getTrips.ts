"use server"

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId } from '@/lib/auth-utils'

export async function getTrips() {
  const supabase = await createClient()
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error('User not authenticated')
  }

  const { data: trips, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching trips:', error)
    throw new Error('Failed to fetch trips')
  }

  return trips || []
}

