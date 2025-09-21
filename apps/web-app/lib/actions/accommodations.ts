'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import {
  AccommodationData,
  AccommodationType,
  CreateAccommodationData,
} from '../types';

export async function createAccommodation(
  data: CreateAccommodationData
): Promise<AccommodationData> {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify the destination belongs to a route in a trip owned by the user
  const { data: destination, error: destinationError } = await supabase
    .from('destinations')
    .select(
      `
      id,
      routes!inner (
        id,
        trips!inner (
          id,
          user_id
        )
      )
    `
    )
    .eq('id', data.destinationId)
    .eq('routes.trips.user_id', user.id)
    .single();

  if (destinationError || !destination) {
    throw new Error('Destination not found or access denied');
  }

  // Create the accommodation
  const { data: accommodation, error } = await supabase
    .from('accommodations')
    .insert({
      destination_id: data.destinationId,
      name: data.name,
      address: data.address,
      cost: data.cost,
      currency: data.currency,
      href: data.href || null,
      type: data.type,
      friend_id: data.friendId || null,
      check_in: data.checkIn ? data.checkIn.toISOString() : null,
      check_out: data.checkOut ? data.checkOut.toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating accommodation:', error);
    throw new Error('Failed to create accommodation');
  }

  revalidatePath(
    `/dashboard/trips/${destination.routes.trips.id}/${destination.routes.id}`
  );

  return {
    id: accommodation.id,
    destinationId: accommodation.destination_id,
    name: accommodation.name,
    address: accommodation.address,
    cost: accommodation.cost,
    currency: accommodation.currency,
    href: accommodation.href,
    type: accommodation.type as AccommodationType,
    friendId: accommodation.friend_id,
    checkIn: accommodation.check_in ? new Date(accommodation.check_in) : undefined,
    checkOut: accommodation.check_out ? new Date(accommodation.check_out) : undefined,
    createdAt: new Date(accommodation.created_at),
    updatedAt: new Date(accommodation.updated_at),
  };
}

export async function getAccommodationByDestinationId(
  destinationId: string
): Promise<AccommodationData | null> {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify the destination belongs to a route in a trip owned by the user and get accommodation
  const { data: accommodations, error } = await supabase
    .from('accommodations')
    .select(
      `
      *,
      destinations!inner (
        id,
        routes!inner (
          id,
          trips!inner (
            id,
            user_id
          )
        )
      )
    `
    )
    .eq('destination_id', destinationId)
    .eq('destinations.routes.trips.user_id', user.id)
    .limit(1);

  if (error) {
    console.error('Error fetching accommodation:', error);
    throw new Error('Failed to fetch accommodation');
  }

  if (!accommodations || accommodations.length === 0) {
    return null;
  }

  const accommodation = accommodations[0];

  return {
    id: accommodation.id,
    destinationId: accommodation.destination_id,
    name: accommodation.name,
    address: accommodation.address,
    cost: accommodation.cost,
    currency: accommodation.currency,
    href: accommodation.href,
    type: accommodation.type as AccommodationType,
    friendId: accommodation.friend_id,
    checkIn: accommodation.check_in ? new Date(accommodation.check_in) : undefined,
    checkOut: accommodation.check_out ? new Date(accommodation.check_out) : undefined,
    createdAt: new Date(accommodation.created_at),
    updatedAt: new Date(accommodation.updated_at),
  };
}
