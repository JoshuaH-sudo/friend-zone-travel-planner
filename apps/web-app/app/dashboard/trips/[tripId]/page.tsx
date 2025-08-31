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
    .select(
      `id,
      name,
      user_id,
      created_at,
      updated_at,
      start_date,
      end_date,
      routes (
        id,
        name,
        trip_id,
        created_at,
        updated_at,
        date_from,
        date_to,
        destinations (
          id,
          location,
          latitude,
          longitude,
          order,
          created_at,
          updated_at,
          days,
          friends (
            id,
            name
          ),
          accommodations (
            id,
            name,
            address,
            cost,
            currency,
            href,
            type,
            friend_id,
            created_at,
            updated_at
          ),
          transports (
            id,
            name,
            address,
            cost,
            currency,
            href,
            type,
            departure_at,
            arrival_at,
            duration,
            created_at,
            updated_at
          )
        )
      )`
    )
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single();

  if (tripError || !trip) {
    notFound();
  }

  return (
    <TripOverviewClient
      trip={trip}
      routes={trip.routes || []}
      tripId={tripId}
    />
  );
}
