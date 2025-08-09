"use server"

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache'

interface CreateFriendData {
  name: string
  location: string
  latitude: number
  longitude: number
  street?: string
  city?: string
  state_province?: string
  country?: string
  postal_code?: string
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
      street: data.street || null,
      city: data.city || null,
      state_province: data.state_province || null,
      country: data.country || null,
      postal_code: data.postal_code || null,
      user_id: user.id,
      destination_id: data.destinationId || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating friend:', error)
    throw new Error('Failed to create friend')
  }

  revalidatePath('/dashboard/friends')
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

interface UpdateFriendData {
  id: string
  name?: string
  location?: string
  latitude?: number
  longitude?: number
  street?: string
  city?: string
  state_province?: string
  country?: string
  postal_code?: string
  destinationId?: string
}

export async function updateFriend(data: UpdateFriendData) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Verify the friend belongs to the user
  const { data: existingFriend, error: checkError } = await supabase
    .from('friends')
    .select('id')
    .eq('id', data.id)
    .eq('user_id', user.id)
    .single()

  if (checkError || !existingFriend) {
    throw new Error('Friend not found or access denied')
  }

  const updateData: any = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.location !== undefined) updateData.location = data.location
  if (data.latitude !== undefined) updateData.latitude = data.latitude
  if (data.longitude !== undefined) updateData.longitude = data.longitude
  if (data.street !== undefined) updateData.street = data.street
  if (data.city !== undefined) updateData.city = data.city
  if (data.state_province !== undefined) updateData.state_province = data.state_province
  if (data.country !== undefined) updateData.country = data.country
  if (data.postal_code !== undefined) updateData.postal_code = data.postal_code
  if (data.destinationId !== undefined) updateData.destination_id = data.destinationId

  const { data: friend, error } = await supabase
    .from('friends')
    .update(updateData)
    .eq('id', data.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating friend:', error)
    throw new Error('Failed to update friend')
  }

  revalidatePath('/dashboard/friends')
  return friend
}

export async function deleteFriend(friendId: string) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('id', friendId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting friend:', error)
    throw new Error('Failed to delete friend')
  }

  revalidatePath('/dashboard/friends')
  return { success: true }
}
