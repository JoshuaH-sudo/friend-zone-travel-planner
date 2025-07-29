'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { getAddressCoordinates } from '@/lib/actions/google'

const friendSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
})

type CreateFriendData = z.infer<typeof friendSchema>

export default async function createFriend(data: CreateFriendData) {
  // Validate input data
  const validationResult = friendSchema.safeParse(data)
  if (!validationResult.success) {
    throw new Error(`Validation failed: ${validationResult.error.errors.map(e => e.message).join(', ')}`)
  }

  const validatedData = validationResult.data
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Construct full address for geocoding, filter any empty fields
  const fullAddress = validatedData.address;

  // Get coordinates from Google Geocoding API
  const geocodeResult = await getAddressCoordinates(fullAddress)
  
  if (geocodeResult.status !== 'OK' || !geocodeResult.results) {
    throw new Error('Unable to geocode address. Please check the address and try again.')
  }

  const { lat, lng } = geocodeResult.results.geometry.location

  const { data: friend, error } = await supabase
    .from('friends')
    .insert({
      name: validatedData.name,
      location: fullAddress, // Keep for backward compatibility
      latitude: lat,
      longitude: lng,
      street: 'Unknown', // Placeholder since we only have full address
      city: 'Unknown', // Placeholder since we only have full address
      state_province: null,
      country: 'Unknown', // Placeholder since we only have full address
      postal_code: null,
      user_id: user.id,
      destination_id: null,
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

