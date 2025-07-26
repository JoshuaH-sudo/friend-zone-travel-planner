"use server"

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth';
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
  const user = await getUser()

  if (!user) {
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
      .eq('routes.trips.user_id', user.id)
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
      user_id: user,
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
  const user = await getUser()

  if (!user) {
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
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching friends:', error)
    throw new Error('Failed to fetch friends')
  }

  return friends || []
}

export interface GetFriendsByGeoLocationProps {
  lat: number;
  lng: number;
}

export async function getFriendsByGeoLocation({
  lat,
  lng,
}: GetFriendsByGeoLocationProps) {
  const supabase = await createClient()
  const user = await getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: friends, error } = await supabase
    .from('friends')
    .select('id, name, location, latitude, longitude')
    .eq('user_id', user.id)
    .gte('latitude', lat - 0.1)
    .lte('latitude', lat + 0.1)
    .gte('longitude', lng - 0.1)
    .lte('longitude', lng + 0.1)

  if (error) {
    console.error('Error fetching friends by geo location:', error)
    throw new Error('Failed to fetch friends by location')
  }

  return friends || []
}
