"use server"

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export type DeleteRouteProps = {
  routeId: string
  tripId: string
}

async function deleteRoute({ routeId, tripId }: DeleteRouteProps) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Ensure the route belongs to a trip owned by the user
  const { data: route, error: fetchError } = await supabase
    .from('routes')
    .select(`id, trip_id, trips!inner(id, user_id)`) // join to verify ownership
    .eq('id', routeId)
    .eq('trips.user_id', user.id)
    .single()

  if (fetchError || !route) {
    throw new Error('Route not found or access denied')
  }

  const { error: deleteError } = await supabase
    .from('routes')
    .delete()
    .eq('id', routeId)

  if (deleteError) {
    console.error('Error deleting route:', deleteError)
    throw new Error('Failed to delete route')
  }

  revalidatePath(`/dashboard/trips/${tripId}`)
  return { success: true }
}

export default deleteRoute
