'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function deleteTrip(tripId: string) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Ensure the trip belongs to the current user
  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select('id, user_id')
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !trip) {
    throw new Error('Trip not found or access denied');
  }

  const { error: deleteError } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId);

  if (deleteError) {
    console.error('Error deleting trip:', deleteError);
    throw new Error('Failed to delete trip');
  }

  revalidatePath('/dashboard/trips');
  return { success: true };
}

export default deleteTrip;
