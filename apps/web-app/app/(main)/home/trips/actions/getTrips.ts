'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';;

export async function getTrips() {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: trips, error } = await supabase
    .from('trips')
    .select(`
      *,
      routes (
        id,
        name,
        created_at,
        updated_at,
        destinations (
          id,
          location,
          latitude,
          longitude,
          order,
          start_date,
          end_date,
          created_at,
          updated_at,
          friends (
            id,
            name
          )
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching trips:', error);
    throw new Error('Failed to fetch trips');
  }

  return trips || [];
}
