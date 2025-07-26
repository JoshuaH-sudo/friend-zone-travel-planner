"use server"

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache'

interface UpdateRouteData {
  id: string
  name: string
  tripId: string
}

export async function updateRoute(data: UpdateRouteData) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Verify the route belongs to a trip owned by the user
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select(`
      id,
      trips!inner (
        id,
        user_id
      )
    `)
    .eq('id', data.id)
    .eq('trips.user_id', user.id)
    .single()

  if (routeError || !route) {
    throw new Error('Route not found or access denied')
  }

  const { data: updatedRoute, error } = await supabase
    .from('routes')
    .update({
      name: data.name,
    })
    .eq('id', data.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating route:', error)
    throw new Error('Failed to update route')
  }

  revalidatePath(`/home/trips/${data.tripId}`)
  return updatedRoute
}

