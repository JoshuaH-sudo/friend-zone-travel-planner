import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import TripOverviewClient from './components/tripOverviewClient';
import { getUser } from '@/lib/auth';
import useGetTripById from '../hooks/useGetTripById';

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

  const { data: trip, error: tripError } = useGetTripById({ tripId });

  if (tripError || !trip) {
    console.error('Error fetching trip:', tripError);
    notFound();
  }

  return (
    <TripOverviewClient trip={trip} routes={trip?.routes || []} tripId={tripId} />
  );
}
