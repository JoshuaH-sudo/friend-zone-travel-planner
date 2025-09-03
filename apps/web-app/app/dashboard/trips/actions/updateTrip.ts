'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

interface UpdateTripData {
  tripId: string;
  name?: string;
  startDate?: Date;
  endDate?: Date;
}

async function updateTrip(data: UpdateTripData) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify the trip belongs to the user
  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select('id, user_id')
    .eq('id', data.tripId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !trip) {
    throw new Error('Trip not found or access denied');
  }

  // Prepare update data
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.startDate !== undefined) {
    updateData.start_date = data.startDate.toISOString();
  }

  if (data.endDate !== undefined) {
    updateData.end_date = data.endDate.toISOString();
  }

  // Update the trip
  const { data: updatedTrip, error: updateError } = await supabase
    .from('trips')
    .update(updateData)
    .eq('id', data.tripId)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating trip:', updateError);
    throw new Error('Failed to update trip');
  }

  revalidatePath(`/dashboard/trips/${data.tripId}`);
  return updatedTrip;
}

export default updateTrip;
