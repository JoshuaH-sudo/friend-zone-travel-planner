"use server"

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

interface CreateFriendData {
  name: string
  location: string
  latitude: number
  longitude: number
  destinationId?: string
}

export async function createFriend(data: CreateFriendData) {
  const supabase = await createClient()
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error('User not authenticated')
  }

  // If destinationId is provided, verify it belongs to the user
  if (data.destinationId) {
    const { data: destination, error: destError } = await supabase
      .from('destinations')
      .select(`
        id,
        routes!inner (
          id,
          trips!inner (
            id,
            user_id
          )
        )
      `)
      .eq('id', data.destinationId)
      .eq('routes.trips.user_id', userId)
      .single()

    if (destError || !destination) {
      throw new Error('Destination not found or access denied')
    }
  }

  const { data: friend, error } = await supabase
    .from('friends')
    .insert({
      name: data.name,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      user_id: userId,
      destination_id: data.destinationId || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating friend:', error)
    throw new Error('Failed to create friend')
  }

  revalidatePath('/home/friends')
  return friend
}

export async function getFriends() {
  const supabase = await createClient()
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error('User not authenticated')
  }

  const { data: friends, error } = await supabase
    .from('friends')
    .select(`
      *,
      destinations (
        id,
        location
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching friends:', error)
    throw new Error('Failed to fetch friends')
  }

  return friends || []
}

