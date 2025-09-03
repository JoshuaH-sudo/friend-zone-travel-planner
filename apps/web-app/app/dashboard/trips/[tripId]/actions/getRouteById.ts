'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';

interface GetRouteByIdParams {
  routeId: string;
}

export async function getRouteById({ routeId }: GetRouteByIdParams) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify the route belongs to a trip owned by the user
  const { data: route, error } = await supabase
    .from('routes')
    .select(`
      id,
      name,
      trip_id,
      created_at,
      updated_at,
      date_to,
      date_from,
      destinations (
        id,
        route_id,
        location,
        latitude,
        longitude,
        order,
        created_at,
        updated_at,
        days,
        start_date,
        end_date,
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
      ),
      trips!inner (
        id,
        user_id
      )
    `)
    .eq('id', routeId)
    .eq('trips.user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching route:', error);
    throw new Error('Failed to fetch route');
  }

  if (!route) {
    throw new Error('Route not found or access denied');
  }

  return route;
}
