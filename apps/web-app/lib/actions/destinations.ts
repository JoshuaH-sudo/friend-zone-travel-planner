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
  days: number
  startDate?: Date
  endDate?: Date
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
  const { data: highestOrderDestination } = await supabase
    .from('destinations')
    .select('order')
    .eq('route_id', data.routeId)
    .order('order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = highestOrderDestination ? highestOrderDestination.order + 1 : 1

  // For backward compatibility, we'll still set start_date and end_date
  // We'll use the current date as start_date and calculate end_date based on days
  // if they're not provided
  const startDate = data.startDate || new Date();
  const endDate = data.endDate || new Date(startDate);
  if (!data.endDate) {
    endDate.setDate(startDate.getDate() + data.days - 1);
  }

  const { data: destination, error } = await supabase
    .from('destinations')
    .insert({
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      route_id: data.routeId,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      days: data.days,
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
  latitude: number
  longitude: number
  friendIds: string[]
  days: number
  startDate?: Date
  endDate?: Date
  accommodation?: {
    name: string
    address: string
    cost: number
    currency: string
    href?: string
    type: 'hotel' | 'motel' | 'hostel' | 'friend' | 'airbnb' | 'other'
    friendId?: string
  }
  transport?: {
    name: string
    address: string
    cost: number
    currency: string
    href?: string
    type: 'airplane' | 'bus' | 'car' | 'train' | 'ferry' | 'other'
    departureAt?: Date
    arrivalAt?: Date
    duration?: number
  }
}

export interface AddDestinationToRouteResponse {
  id: string
  location: string
  latitude: number
  longitude: number
  days: number
  startDate?: Date
  endDate?: Date
  order: number
  accommodationId?: string
  transportId?: string
}

export async function addDestinationToRoute(data: AddDestinationToRouteProps): Promise<AddDestinationToRouteResponse> {
  const destination = await createDestination({
    location: data.location,
    routeId: data.routeId,
    days: data.days,
    startDate: data.startDate,
    endDate: data.endDate,
    latitude: data.latitude,
    longitude: data.longitude,
  })

  let accommodationId: string | undefined;
  let transportId: string | undefined;

  // Create accommodation if provided
  if (data.accommodation) {
    const { createAccommodation } = await import('./accommodations');
    const accommodation = await createAccommodation({
      destinationId: destination.id,
      name: data.accommodation.name,
      address: data.accommodation.address,
      cost: data.accommodation.cost,
      currency: data.accommodation.currency,
      href: data.accommodation.href,
      type: data.accommodation.type,
      friendId: data.accommodation.friendId,
    });
    accommodationId = accommodation.id;
  }

  // Create transport if provided
  if (data.transport) {
    const { createTransport } = await import('./transports');
    const transport = await createTransport({
      destinationId: destination.id,
      name: data.transport.name,
      address: data.transport.address,
      cost: data.transport.cost,
      currency: data.transport.currency,
      href: data.transport.href,
      type: data.transport.type,
      departureAt: data.transport.departureAt,
      arrivalAt: data.transport.arrivalAt,
      duration: data.transport.duration,
    });
    transportId = transport.id;
  }

  return {
    id: destination.id,
    location: destination.location,
    latitude: destination.latitude,
    longitude: destination.longitude,
    startDate: new Date(destination.start_date),
    endDate: new Date(destination.end_date),
    days: destination.days,
    order: destination.order,
    accommodationId,
    transportId,
  }
}

// Update destination function
export interface UpdateDestinationProps {
  destinationId: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  days?: number;
  friendIds?: string[];
  accommodation?: {
    name: string;
    address: string;
    cost: number;
    currency: string;
    href?: string;
    type: 'hotel' | 'motel' | 'hostel' | 'friend' | 'airbnb' | 'other';
    friendId?: string;
  };
  transport?: {
    name: string;
    address: string;
    cost: number;
    currency: string;
    href?: string;
    type: 'airplane' | 'bus' | 'car' | 'train' | 'ferry' | 'other';
    departureAt?: Date;
    arrivalAt?: Date;
    duration?: number;
  };
}

export async function updateDestination(data: UpdateDestinationProps) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Verify the destination belongs to a route owned by the user
  const { data: destination, error: destinationError } = await supabase
    .from('destinations')
    .select(`
      id,
      route_id,
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

  if (destinationError || !destination) {
    throw new Error('Destination not found or access denied')
  }

  // Prepare update data
  const updateData: any = {}
  if (data.location !== undefined) updateData.location = data.location
  if (data.latitude !== undefined) updateData.latitude = data.latitude
  if (data.longitude !== undefined) updateData.longitude = data.longitude
  if (data.days !== undefined) {
    updateData.days = data.days
    // Update start_date and end_date based on days for backward compatibility
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + data.days - 1)
    updateData.start_date = startDate.toISOString()
    updateData.end_date = endDate.toISOString()
  }

  // Update the destination
  const { data: updatedDestination, error: updateError } = await supabase
    .from('destinations')
    .update(updateData)
    .eq('id', data.destinationId)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating destination:', updateError)
    throw new Error('Failed to update destination')
  }

  // Handle accommodation update
  if (data.accommodation) {
    const { updateAccommodation } = await import('./accommodations');
    
    // Check if accommodation already exists for this destination
    const { data: existingAccommodation } = await supabase
      .from('accommodations')
      .select('id')
      .eq('destination_id', data.destinationId)
      .single()

    if (existingAccommodation) {
      await updateAccommodation({
        accommodationId: existingAccommodation.id,
        name: data.accommodation.name,
        address: data.accommodation.address,
        cost: data.accommodation.cost,
        currency: data.accommodation.currency,
        href: data.accommodation.href,
        type: data.accommodation.type,
        friendId: data.accommodation.friendId,
      });
    } else {
      const { createAccommodation } = await import('./accommodations');
      await createAccommodation({
        destinationId: data.destinationId,
        name: data.accommodation.name,
        address: data.accommodation.address,
        cost: data.accommodation.cost,
        currency: data.accommodation.currency,
        href: data.accommodation.href,
        type: data.accommodation.type,
        friendId: data.accommodation.friendId,
      });
    }
  }

  // Handle transport update
  if (data.transport) {
    const { updateTransport } = await import('./transports');
    
    // Check if transport already exists for this destination
    const { data: existingTransport } = await supabase
      .from('transports')
      .select('id')
      .eq('destination_id', data.destinationId)
      .single()

    if (existingTransport) {
      await updateTransport({
        transportId: existingTransport.id,
        name: data.transport.name,
        address: data.transport.address,
        cost: data.transport.cost,
        currency: data.transport.currency,
        href: data.transport.href,
        type: data.transport.type,
        departureAt: data.transport.departureAt,
        arrivalAt: data.transport.arrivalAt,
        duration: data.transport.duration,
      });
    } else {
      const { createTransport } = await import('./transports');
      await createTransport({
        destinationId: data.destinationId,
        name: data.transport.name,
        address: data.transport.address,
        cost: data.transport.cost,
        currency: data.transport.currency,
        href: data.transport.href,
        type: data.transport.type,
        departureAt: data.transport.departureAt,
        arrivalAt: data.transport.arrivalAt,
        duration: data.transport.duration,
      });
    }
  }

  revalidatePath(`/dashboard/trips/${destination.routes.trips.id}/${destination.route_id}`)
  return updatedDestination
}
