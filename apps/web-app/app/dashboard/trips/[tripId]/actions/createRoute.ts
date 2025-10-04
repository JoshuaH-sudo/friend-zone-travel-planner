"use server"

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache'
import { Database } from '@/lib/supabase/database.types';

type CreateRouteData = Omit<Database['public']['Tables']['routes']['Insert'], 'user_id'>;

export async function createRoute(data: CreateRouteData) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Verify the trip belongs to the user
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('id, start_date, end_date')
    .eq('id', data.trip_id)
    .eq('user_id', user.id)
    .single()

  if (tripError || !trip) {
    throw new Error('Trip not found or access denied')
  }

  const routeData: Database['public']['Tables']['routes']['Insert'] = {
    name: data.name,
    trip_id: data.trip_id,
  };


  const { data: route, error } = await supabase
    .from('routes')
    .insert(routeData)
    .select()
    .single()

  if (error) {
    console.error('Error creating route:', error)
    throw new Error('Failed to create route')
  }

  revalidatePath(`/dashboard/trips/${data.trip_id}`)
  return route
}
