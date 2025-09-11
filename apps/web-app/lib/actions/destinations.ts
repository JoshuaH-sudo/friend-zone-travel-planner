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
      ),
      friends (
        id,
        name,
        location
      ),
      accommodations (
        id,
        name,
        address,
        cost,
        currency,
        href,
        type,
        friend_id
      ),
      transports (
        id,
        name,
        address,
        cost,
        currency,
        href,
        type,
        departure_at,
        arrival_at,
        duration
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
  startDate: Date;
  endDate: Date;
  accommodation?: {
    name: string;
    address?: string;
    cost: number;
    currency: string;
    href?: string;
    type: 'hotel' | 'motel' | 'hostel' | 'friend' | 'airbnb' | 'other';
    friendId?: string;
  };
  transport?: {
    name: string;
    address?: string;
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

export interface EditDestinationProps extends AddDestinationToRouteProps {
  id: string;
}

export async function editDestination(
  data: EditDestinationProps
): Promise<AddDestinationToRouteResponse> {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify the destination belongs to a route of a trip owned by the user
  const { data: existingDestination, error: destError } = await supabase
    .from('destinations')
    .select(
      `
      id,
      route_id,
      routes!inner (
        id,
        trips!inner (
          id,
          user_id
        )
      )
    `
    )
    .eq('id', data.id)
    .eq('routes.trips.user_id', user.id)
    .single();

  if (destError || !existingDestination) {
    throw new Error('Destination not found or access denied');
  }

  const start_date = data.startDate.toISOString();
  const end_date = data.endDate.toISOString();
  
  // Calculate days based on start and end dates
  const days = Math.round((new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Update the destination
  const { data: updatedDestination, error } = await supabase
    .from('destinations')
    .update({
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      days: days,
      start_date: start_date,
      end_date: end_date,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating destination:', error);
    throw new Error('Failed to update destination');
  }

  let accommodationId: string | undefined;
  let transportId: string | undefined;

  // Handle accommodation update or creation
  if (data.accommodation) {
    // Check if the destination already has an accommodation
    const { data: existingAccommodation } = await supabase
      .from('accommodations')
      .select('id')
      .eq('destination_id', data.id)
      .maybeSingle();

    if (existingAccommodation) {
      // Update existing accommodation
      const { data: updatedAccommodation, error: accommodationError } = await supabase
        .from('accommodations')
        .update({
          name: data.accommodation.name,
          address: data.accommodation.address,
          cost: data.accommodation.cost,
          currency: data.accommodation.currency,
          href: data.accommodation.href,
          type: data.accommodation.type,
          friend_id: data.accommodation.friendId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingAccommodation.id)
        .select()
        .single();

      if (accommodationError) {
        console.error('Error updating accommodation:', accommodationError);
      } else {
        accommodationId = updatedAccommodation.id;
      }
    } else {
      // Create new accommodation
      const accommodation = await createAccommodation({
        destinationId: data.id,
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
  }

  // Handle transport update or creation
  if (data.transport) {
    // Check if the destination already has a transport
    const { data: existingTransport } = await supabase
      .from('transports')
      .select('id')
      .eq('destination_id', data.id)
      .maybeSingle();

    if (existingTransport) {
      // Update existing transport
      const { data: updatedTransport, error: transportError } = await supabase
        .from('transports')
        .update({
          name: data.transport.name,
          address: data.transport.address,
          cost: data.transport.cost,
          currency: data.transport.currency,
          href: data.transport.href,
          type: data.transport.type,
          departure_at: data.transport.departureAt ? data.transport.departureAt.toISOString() : undefined,
          arrival_at: data.transport.arrivalAt ? data.transport.arrivalAt.toISOString() : undefined,
          duration: data.transport.duration,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingTransport.id)
        .select()
        .single();

      if (transportError) {
        console.error('Error updating transport:', transportError);
      } else {
        transportId = updatedTransport.id;
      }
    } else {
      // Create new transport
      const transport = await createTransport({
        destinationId: data.id,
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
  }

  revalidatePath(`/dashboard/trips/${existingDestination.routes.trips.id}/${existingDestination.route_id}`);

  return {
    id: updatedDestination.id,
    location: updatedDestination.location,
    latitude: updatedDestination.latitude,
    longitude: updatedDestination.longitude,
    order: updatedDestination.order,
    days: updatedDestination.days,
    accommodationId,
    transportId,
  };
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
  
  // Use the provided start and end dates
  const start_date = data.startDate.toISOString();
  const end_date = data.endDate.toISOString();
  
  // Calculate days based on start and end dates
  const days = Math.round((new Date(end_date).getTime() - new Date(start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Update route date_from and date_to based on destinations
  // await updateRouteDateRange(data.routeId, destinations, start_date, end_date.toISOString());
  
  const destination = await createDestination({
    location: data.location,
    routeId: data.routeId,
    days: days, // Use the calculated days
    latitude: data.latitude,
    longitude: data.longitude,
    route_id: data.routeId,
    start_date: start_date,
    end_date: end_date,
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
