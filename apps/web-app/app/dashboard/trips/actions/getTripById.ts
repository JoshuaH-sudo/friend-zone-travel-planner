'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';

interface GetTripByIdParams {
  tripId: string;
}

export type TripByIdResponse = Awaited<ReturnType<typeof getTripById>>;

export async function getTripById({ tripId }: GetTripByIdParams) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify the trip belongs to the user
  const { data: trip, error } = await supabase
    .from('trips')
    .select(
      `
      id,
      name,
      user_id,
      created_at,
      updated_at,
      routes (
        id,
        name,
        trip_id,
        created_at,
        updated_at,
        destinations (
          id,
          route_id,
          location,
          latitude,
          longitude,
          order,
          start_date,
          end_date,
          created_at,
          updated_at,
          days,
          friends (
            id,
            name
          ),
          accommodations (
            id,
            name,
            address,
            cost,
            currency,
            href,
            type,
            friend_id,
            check_in,
            check_out,
            created_at,
            updated_at
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
            duration,
            created_at,
            updated_at
          )
        )
      )
    `
    )
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching trip:', error);
    throw new Error('Failed to fetch trip');
  }

  if (!trip) {
    throw new Error('Trip not found or access denied');
  }

  return trip;
}
