"use server"

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

interface CreateRouteData {
  name: string
  tripId: string
}

export async function createRoute(data: CreateRouteData) {
  const supabase = await createClient()
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error('User not authenticated')
  }

  // Verify the trip belongs to the user
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('id')
    .eq('id', data.tripId)
    .eq('user_id', userId)
    .single()

  if (tripError || !trip) {
    throw new Error('Trip not found or access denied')
  }

  const { data: route, error } = await supabase
    .from('routes')
    .insert({
      name: data.name,
      trip_id: data.tripId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating route:', error)
    throw new Error('Failed to create route')
  }

  revalidatePath(`/home/trips/${data.tripId}`)
  return route
}

