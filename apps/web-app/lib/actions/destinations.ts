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
  return (destinations || []).map((destination) => ({
    id: destination.id,
    location: destination.location,
    latitude: destination.latitude,
    longitude: destination.longitude,
    order: destination.order,
  }));
}

type CreateDestinationData = Omit<
  Database['public']['Tables']['destinations']['Insert'],
  'order'
> & {
  routeId: string;
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

export async function addDestinationToRoute(
  data: AddDestinationToRouteProps
): Promise<AddDestinationToRouteResponse> {
  const destination = await createDestination({
    location: data.location,
    routeId: data.routeId,
    days: data.days,
    latitude: data.latitude,
    longitude: data.longitude,
    route_id: data.routeId,
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
