import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { TripRouteParams } from '../page';
import RouteClientWrapper from './components/routeClientWrapper';

export type RouteParams = TripRouteParams & {
  routeId: string;
};

export type RoutePageProps = {
  params: Promise<RouteParams>;
};

export default async function NewRoutePage({ params }: RoutePageProps) {
  const { routeId } = await params;
  const supabase = await createClient();
  const user = await getUser();

  // Fetch route with verification that it belongs to a trip owned by the user
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select(
      `
      *,
      trips!inner (
        id,
        name,
        user_id
      ),
      destinations (
        id,
        route_id,
        location,
        latitude,
        longitude,
        order,
        days,
        start_date,
        end_date,
        created_at,
        updated_at
      )
    `
    )
    .eq('id', routeId)
    .eq('trips.user_id', user.id)
    .single();

  if (routeError || !route) {
    notFound();
  }

  const locations = route.destinations.map((destination) => ({
    key: destination.id,
    location: {
      lat: destination.latitude,
      lng: destination.longitude,
    },
  }));

  // Get the most recent destination to use as previous destination for transport
  const previousDestination =
    route.destinations.length > 0
      ? route.destinations[route.destinations.length - 1]
      : undefined;

  return (
    <RouteClientWrapper
      route={route}
      tripId={route.trips.id}
      locations={locations}
      previousDestination={previousDestination}
    />
  );
}
