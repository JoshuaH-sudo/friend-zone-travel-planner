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
        location,
        latitude,
        longitude,
        order,
        days
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
  const previousDestination = route.destinations.length > 0 
    ? route.destinations[route.destinations.length - 1]
    : undefined;

  return (
    <RouteClientWrapper
      routeId={routeId}
      tripId={route.trips.id}
      initialRouteName={route.name}
      locations={locations}
      previousDestination={previousDestination ? {
        location: previousDestination.location,
        latitude: previousDestination.latitude,
        longitude: previousDestination.longitude,
      } : undefined}
    />
  );
}
