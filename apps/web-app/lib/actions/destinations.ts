'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Database } from '../supabase/database.types';
import { createAccommodation } from './accommodations';
import { createTransport } from './transports';

export async function getDestinations() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: destinations, error } = await supabase
    .from('destinations')
    .select(
      `
      *,
      routes!inner (
        id,
        trips!inner (
          id,
          user_id
        )
      )
    `
    )
    .eq('routes.trips.user_id', user.id)
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching destinations:', error);
    throw new Error('Failed to fetch destinations');
  }

  return destinations || [];
}

export async function getDestinationsByRouteId(routeId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify the route belongs to a trip owned by the user and get destinations
  const { data: destinations, error } = await supabase
    .from('destinations')
    .select(
      `
      *,
      routes!inner (
        id,
        trips!inner (
          id,
          user_id
        )
      )
    `
    )
    .eq('route_id', routeId)
    .eq('routes.trips.user_id', user.id)
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching destinations:', error);
    throw new Error('Failed to fetch destinations');
  }

  // Transform the data to match the expected interface
  return destinations || [];
}

type CreateDestinationData = Omit<
  Database['public']['Tables']['destinations']['Insert'],
  'order'
> & {
  routeId: string;
  start_date: string;
  end_date: string;
};

export async function createDestination(data: CreateDestinationData) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify the route belongs to a trip owned by the user
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select(
      `
      id,
      trips!inner (
        id,
        user_id
      )
    `
    )
    .eq('id', data.routeId)
    .eq('trips.user_id', user.id)
    .single();

  if (routeError || !route) {
    throw new Error('Route not found or access denied');
  }

  // Get the highest order number for this route
  const { data: highestOrderDestination } = await supabase
    .from('destinations')
    .select('order')
    .eq('route_id', data.routeId)
    .order('order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = highestOrderDestination
    ? highestOrderDestination.order + 1
    : 1;

  const { data: destination, error } = await supabase
    .from('destinations')
    .insert({
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      route_id: data.routeId,
      days: data.days,
      order: nextOrder,
      start_date: data.start_date,
      end_date: data.end_date,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating destination:', error);
    throw new Error('Failed to create destination');
  }

  revalidatePath(`/dashboard/trips/${route.trips.id}/${data.routeId}`);
  return destination;
}

// Types for the AddDestinationForm
export interface AddDestinationToRouteProps {
  routeId: string;
  location: string;
  latitude: number;
  longitude: number;
  friendIds: string[];
  days: number;
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

export interface AddDestinationToRouteResponse {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  days: number;
  order: number;
  accommodationId?: string;
  transportId?: string;
}

// Helper function to update route date range based on its destinations
async function updateRouteDateRange(
  routeId: string,
  existingDestinations: any[] | null,
  newStartDate: string,
  newEndDate: string
) {
  const supabase = await createClient();
  
  let earliestDate = new Date(newStartDate);
  let latestDate = new Date(newEndDate);
  
  // Check existing destinations to find the earliest start_date and latest end_date
  if (existingDestinations && existingDestinations.length > 0) {
    existingDestinations.forEach(dest => {
      const destStart = new Date(dest.start_date);
      const destEnd = new Date(dest.end_date);
      
      if (destStart < earliestDate) {
        earliestDate = destStart;
      }
      
      if (destEnd > latestDate) {
        latestDate = destEnd;
      }
    });
  }
  
  // Update the route with the calculated date range
  const { error } = await supabase
    .from('routes')
    .update({
      date_from: earliestDate.toISOString(),
      date_to: latestDate.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', routeId);
    
  if (error) {
    console.error('Error updating route date range:', error);
    // Don't throw here as this is a secondary operation
  }
}

export async function addDestinationToRoute(
  data: AddDestinationToRouteProps
): Promise<AddDestinationToRouteResponse> {
  // First, get the trip's start/end dates and previous destinations
  const supabase = await createClient();
  const user = await getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Get route information and associated trip dates
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select(`
      id,
      date_from,
      date_to,
      trips!inner (
        id,
        start_date,
        end_date,
        user_id
      )
    `)
    .eq('id', data.routeId)
    .eq('trips.user_id', user.id)
    .single();

  if (routeError || !route) {
    throw new Error('Route not found or access denied');
  }
  
  // Get previous destinations in order
  const { data: destinations, error: destinationsError } = await supabase
    .from('destinations')
    .select('id, start_date, end_date, days')
    .eq('route_id', data.routeId)
    .order('order', { ascending: true });
    
  if (destinationsError) {
    console.error('Error fetching destinations:', destinationsError);
    throw new Error('Failed to fetch destinations');
  }
  
  // Calculate start_date based on previous destination or route date_from
  let start_date: string;
  if (destinations && destinations.length > 0) {
    // Use the end date of the last destination as the start date for this one
    const lastDestination = destinations[destinations.length - 1];
    start_date = new Date(lastDestination.end_date).toISOString();
  } else {
    // First destination - use the route's date_from or fallback to the current date if null
    start_date = route.date_from ?? new Date().toISOString();
  }
  
  // Calculate end_date by adding the days to the start_date
  const end_date = new Date(start_date);
  end_date.setDate(end_date.getDate() + (data.days - 1)); // -1 because the first day counts
  
  // Update route date_from and date_to based on destinations
  // await updateRouteDateRange(data.routeId, destinations, start_date, end_date.toISOString());
  
  const destination = await createDestination({
    location: data.location,
    routeId: data.routeId,
    days: data.days,
    latitude: data.latitude,
    longitude: data.longitude,
    route_id: data.routeId,
    start_date: start_date,
    end_date: end_date.toISOString(),
    updated_at: new Date().toISOString(),
  });

  let accommodationId: string | undefined;
  let transportId: string | undefined;

  // Create accommodation if provided
  if (data.accommodation) {
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
    order: destination.order,
    days: destination.days,
    accommodationId,
    transportId,
  };
}
