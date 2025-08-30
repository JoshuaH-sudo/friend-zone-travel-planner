import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import TripOverviewClient from './components/tripOverviewClient';
import { getUser } from '@/lib/auth';

export type TripRouteParams = {
  locale: string;
  tripId: string;
};

export type TripPageProps = {
  params: Promise<TripRouteParams>;
};

export default async function TripDetails({
  params,
}: {
  params: Promise<TripRouteParams>;
}) {
  const { tripId } = await params;
  const supabase = await createClient();
  const user = await getUser();

  // Fetch trip with verification that it belongs to the user
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single();

  if (tripError || !trip) {
    notFound();
  }

  // Fetch routes for this trip
  const { data: routes, error: routesError } = await supabase
    .from('routes')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true });

  if (routesError) {
    console.error('Error fetching routes:', routesError);
  }

  return (
    <TripOverviewClient trip={trip} routes={routes || []} tripId={tripId} />
  );
}
