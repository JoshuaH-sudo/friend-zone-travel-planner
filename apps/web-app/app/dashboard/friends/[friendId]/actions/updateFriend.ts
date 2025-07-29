'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { getAddressCoordinates } from '@/lib/actions/google'

const friendSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state_province: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  postal_code: z.string().optional(),
})

const updateFriendSchema = z.object({
  id: z.string(),
}).merge(friendSchema.partial())

type UpdateFriendData = z.infer<typeof updateFriendSchema>

export default async function updateFriend(data: UpdateFriendData) {
  // Validate input data
  const validationResult = updateFriendSchema.safeParse(data)
  if (!validationResult.success) {
    throw new Error(`Validation failed: ${validationResult.error.errors.map(e => e.message).join(', ')}`)
  }

  const validatedData = validationResult.data
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Verify the friend belongs to the user
  const { data: existingFriend, error: checkError } = await supabase
    .from('friends')
    .select('*')
    .eq('id', validatedData.id)
    .eq('user_id', user.id)
    .single()

  if (checkError || !existingFriend) {
    throw new Error('Friend not found or access denied')
  }

  const updateData: any = {}
  let shouldGeocode = false

  // Check if address fields have changed
  if (validatedData.name !== undefined) updateData.name = validatedData.name
  if (validatedData.street !== undefined) {
    updateData.street = validatedData.street
    shouldGeocode = true
  }
  if (validatedData.city !== undefined) {
    updateData.city = validatedData.city
    shouldGeocode = true
  }
  if (validatedData.state_province !== undefined) {
    updateData.state_province = validatedData.state_province
    shouldGeocode = true
  }
  if (validatedData.country !== undefined) {
    updateData.country = validatedData.country
    shouldGeocode = true
  }
  if (validatedData.postal_code !== undefined) {
    updateData.postal_code = validatedData.postal_code
    shouldGeocode = true
  }

  // If address fields changed, re-geocode
  if (shouldGeocode) {
    const addressParts = [
      validatedData.street ?? existingFriend.street,
      validatedData.city ?? existingFriend.city,
      validatedData.state_province ?? existingFriend.state_province,
      validatedData.country ?? existingFriend.country,
      validatedData.postal_code ?? existingFriend.postal_code
    ].filter(Boolean)
    
    const fullAddress = addressParts.join(', ')

    const geocodeResult = await getAddressCoordinates(fullAddress)
    
    if (geocodeResult.status !== 'OK' || !geocodeResult.results) {
      throw new Error('Unable to geocode address. Please check the address and try again.')
    }

    const { lat, lng } = geocodeResult.results.geometry.location
    updateData.latitude = lat
    updateData.longitude = lng
    updateData.location = fullAddress
  }

  const { data: friend, error } = await supabase
    .from('friends')
    .update(updateData)
    .eq('id', validatedData.id)
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

