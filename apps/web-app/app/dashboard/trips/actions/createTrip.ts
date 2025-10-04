'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Database } from '@/lib/supabase/database.types';

type CreateTripData = Omit<Database['public']['Tables']['trips']['Insert'], 'user_id'>;

async function createTrip(data: CreateTripData) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: trip, error } = await supabase
    .from('trips')
    .insert({
      name: data.name,
      user_id: user.id,
    })
    .select()
    .single();
  
  // Create a default route for the new trip
  if (trip) {
    await supabase.from('routes').insert({
      name: 'Main Route',
      trip_id: trip.id,
    });
  }

  if (error) {
    console.error('Error creating trip:', error);
    throw new Error('Failed to create trip');
  }

  revalidatePath('/dashboard/trips');
  return trip;
}

export default createTrip;
