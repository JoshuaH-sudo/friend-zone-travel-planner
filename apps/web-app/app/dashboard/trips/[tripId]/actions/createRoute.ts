"use server"

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache'
import { Database } from '@/lib/supabase/database.types';

interface CreateRouteData {
  name: string
  tripId: string
  dateFrom?: Date
  dateTo?: Date
}

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
    .eq('id', data.tripId)
    .eq('user_id', user.id)
    .single()

  if (tripError || !trip) {
    throw new Error('Trip not found or access denied')
  }

  const routeData: Database['public']['Tables']['routes']['Insert'] = {
    name: data.name,
    trip_id: data.tripId,
    // Should share the same date range as the trip initially
    date_from: trip.start_date,
    date_to: trip.end_date,
  };

  // Add date range if provided
  if (data.dateFrom) {
    routeData.date_from = data.dateFrom.toISOString();
  }
  if (data.dateTo) {
    routeData.date_to = data.dateTo.toISOString();
  }

  const { data: route, error } = await supabase
    .from('routes')
    .insert(routeData)
    .select()
    .single()

  if (error) {
    console.error('Error creating route:', error)
    throw new Error('Failed to create route')
  }

  revalidatePath(`/dashboard/trips/${data.tripId}`)
  return route
}
