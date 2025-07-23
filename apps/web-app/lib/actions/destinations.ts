"use server"

import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

export async function getDestinations() {
  const supabase = await createClient()
  const userId = await getCurrentUserId()

  if (!userId) {
    throw new Error('User not authenticated')
  }

  const { data: destinations, error } = await supabase
    .from('destinations')
    .select(`
      *,
      routes!inner (
        id,
        trips!inner (
          id,
          user_id
        )
      )
    `)
    .eq('routes.trips.user_id', userId)
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching destinations:', error)
    throw new Error('Failed to fetch destinations')
  }

  return destinations || []
}

interface CreateDestinationData {
  location: string
  latitude: number
  longitude: number
  routeId: string
  startDate: Date
  endDate: Date
}

export async function createDestination(data: CreateDestinationData) {
  const supabase = await createClient()
  const userId = await getCurrentUserId()

  if (!userId) {
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
    .eq('id', data.routeId)
    .eq('trips.user_id', userId)
    .single()

  if (routeError || !route) {
    throw new Error('Route not found or access denied')
  }

  // Get the highest order number for this route
  const { data: highestOrderDestination, error: orderError } = await supabase
    .from('destinations')
    .select('order')
    .eq('route_id', data.routeId)
    .order('order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = highestOrderDestination ? highestOrderDestination.order + 1 : 1

  const { data: destination, error } = await supabase
    .from('destinations')
    .insert({
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      route_id: data.routeId,
      start_date: data.startDate.toISOString(),
      end_date: data.endDate.toISOString(),
      order: nextOrder,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating destination:', error)
    throw new Error('Failed to create destination')
  }

  revalidatePath(`/home/trips/${route.trips.id}/${data.routeId}`)
  return destination
}

