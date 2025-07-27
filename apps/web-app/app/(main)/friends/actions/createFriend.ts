'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { getAddressCoordinates } from '@/lib/actions/google'

interface CreateFriendData {
  name: string
  street: string
  city: string
  state_province?: string
  country: string
  postal_code?: string
}

export default async function createFriend(data: CreateFriendData) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Construct full address for geocoding
  const addressParts = [
    data.street,
    data.city,
    data.state_province,
    data.country,
    data.postal_code
  ].filter(Boolean)
  
  const fullAddress = addressParts.join(', ')

  // Get coordinates from Google Geocoding API
  const geocodeResult = await getAddressCoordinates(fullAddress)
  
  if (geocodeResult.status !== 'OK' || !geocodeResult.results) {
    throw new Error('Unable to geocode address. Please check the address and try again.')
  }

  const { lat, lng } = geocodeResult.results.geometry.location

  const { data: friend, error } = await supabase
    .from('friends')
    .insert({
      name: data.name,
      location: fullAddress, // Keep for backward compatibility
      latitude: lat,
      longitude: lng,
      street: data.street,
      city: data.city,
      state_province: data.state_province || null,
      country: data.country,
      postal_code: data.postal_code || null,
      user_id: user.id,
      destination_id: null,
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

