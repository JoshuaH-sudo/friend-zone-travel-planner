'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { getAddressCoordinates } from '@/lib/actions/google'

interface UpdateFriendData {
  id: string
  name?: string
  street?: string
  city?: string
  state_province?: string
  country?: string
  postal_code?: string
}

export default async function updateFriend(data: UpdateFriendData) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Verify the friend belongs to the user
  const { data: existingFriend, error: checkError } = await supabase
    .from('friends')
    .select('*')
    .eq('id', data.id)
    .eq('user_id', user.id)
    .single()

  if (checkError || !existingFriend) {
    throw new Error('Friend not found or access denied')
  }

  const updateData: any = {}
  let shouldGeocode = false

  // Check if address fields have changed
  if (data.name !== undefined) updateData.name = data.name
  if (data.street !== undefined) {
    updateData.street = data.street
    shouldGeocode = true
  }
  if (data.city !== undefined) {
    updateData.city = data.city
    shouldGeocode = true
  }
  if (data.state_province !== undefined) {
    updateData.state_province = data.state_province
    shouldGeocode = true
  }
  if (data.country !== undefined) {
    updateData.country = data.country
    shouldGeocode = true
  }
  if (data.postal_code !== undefined) {
    updateData.postal_code = data.postal_code
    shouldGeocode = true
  }

  // If address fields changed, re-geocode
  if (shouldGeocode) {
    const addressParts = [
      data.street ?? existingFriend.street,
      data.city ?? existingFriend.city,
      data.state_province ?? existingFriend.state_province,
      data.country ?? existingFriend.country,
      data.postal_code ?? existingFriend.postal_code
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
    .eq('id', data.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating friend:', error)
    throw new Error('Failed to update friend')
  }

  revalidatePath('/home/friends')
  return friend
}

