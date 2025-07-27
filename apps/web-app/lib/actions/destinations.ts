"use server"

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache'

export async function getDestinations() {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
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
    .eq('routes.trips.user_id', user.id)
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching destinations:', error)
    throw new Error('Failed to fetch destinations')
  }

  return destinations || []
}

export async function getDestinationsByRouteId(routeId: string) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Verify the route belongs to a trip owned by the user and get destinations
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
    .eq('route_id', routeId)
    .eq('routes.trips.user_id', user.id)
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching destinations:', error)
    throw new Error('Failed to fetch destinations')
  }

  // Transform the data to match the expected interface
  return (destinations || []).map(destination => ({
    id: destination.id,
    location: destination.location,
    latitude: destination.latitude,
    longitude: destination.longitude,
    startDate: new Date(destination.start_date),
    endDate: new Date(destination.end_date),
    order: destination.order,
  }))
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
    .eq('id', data.routeId)
    .eq('trips.user_id', user.id)
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

  revalidatePath(`/dashboard/trips/${route.trips.id}/${data.routeId}`)
  return destination
}

// Types for the AddDestinationForm
export interface AddDestinationToRouteProps {
  routeId: string
  location: string
  friendIds: string[]
  startDate: Date
  endDate: Date
}

export interface AddDestinationToRouteResponse {
  id: string
  location: string
  latitude: number
  longitude: number
  startDate: Date
  endDate: Date
  order: number
}

export async function addDestinationToRoute(data: AddDestinationToRouteProps): Promise<AddDestinationToRouteResponse> {
  // For now, we'll use placeholder coordinates since we don't have the geocoding service
  // In a real implementation, you'd geocode the location to get coordinates
  const destination = await createDestination({
    location: data.location,
    latitude: 0, // Placeholder - would be geocoded
    longitude: 0, // Placeholder - would be geocoded
    routeId: data.routeId,
    startDate: data.startDate,
    endDate: data.endDate,
  })

  return {
    id: destination.id,
    location: destination.location,
    latitude: destination.latitude,
    longitude: destination.longitude,
    startDate: new Date(destination.start_date),
    endDate: new Date(destination.end_date),
    order: destination.order,
  }
}

