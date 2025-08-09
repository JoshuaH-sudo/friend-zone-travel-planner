"use server"

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function deleteDestination(destinationId: string, routeId: string, tripId: string) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Ensure the destination belongs to a route of a trip owned by the user
  const { data: destination, error: fetchError } = await supabase
    .from('destinations')
    .select(`id, route_id, routes!inner(id, trip_id, trips!inner(id, user_id))`)
    .eq('id', destinationId)
    .eq('routes.trips.user_id', user.id)
    .single()

  if (fetchError || !destination) {
    throw new Error('Destination not found or access denied')
  }

  const { error: deleteError } = await supabase
    .from('destinations')
    .delete()
    .eq('id', destinationId)

  if (deleteError) {
    console.error('Error deleting destination:', deleteError)
    throw new Error('Failed to delete destination')
  }

  revalidatePath(`/dashboard/trips/${tripId}/${routeId}`)
  return { success: true }
}

export default deleteDestination
