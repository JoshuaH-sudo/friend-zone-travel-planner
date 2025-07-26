import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import TripOverviewClient from './components/tripOverviewClient';

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
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    notFound();
  }

  // Fetch trip with verification that it belongs to the user
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('user_id', user.data.user.id)
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

  // Transform the data to match the expected interface
  const transformedTrip = {
    id: trip.id,
    name: trip.name,
    startDate: trip.start_date ? new Date(trip.start_date) : undefined,
    endDate: trip.end_date ? new Date(trip.end_date) : undefined,
  };

  const transformedRoutes = (routes || []).map((route) => ({
    id: route.id,
    name: route.name,
  }));

  return (
    <TripOverviewClient
      trip={transformedTrip}
      routes={transformedRoutes}
      tripId={tripId}
    />
  );
}
