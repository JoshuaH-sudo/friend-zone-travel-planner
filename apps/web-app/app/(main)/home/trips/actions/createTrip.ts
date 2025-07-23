"use server"

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

interface CreateTripData {
  name: string
  startDate: Date
  endDate: Date
}

async function createTrip(data: CreateTripData) {
  const supabase = await createClient()
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error('User not authenticated')
  }

  const { data: trip, error } = await supabase
    .from('trips')
    .insert({
      name: data.name,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate.toISOString(),
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating trip:', error)
    throw new Error('Failed to create trip')
  }

  revalidatePath('/home/trips')
  return trip
}

export default createTrip