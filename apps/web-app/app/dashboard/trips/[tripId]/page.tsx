import { notFound } from 'next/navigation';
import TripOverviewClient from './components/tripOverviewClient';
import { getTripById } from '../actions/getTripById';

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

  // Fetch trip with verification that it belongs to the user
  try {
    const trip = await getTripById({ tripId });

    if (!trip) {
      notFound();
    }

    return (
      <TripOverviewClient
        trip={trip}
        tripId={tripId}
      />
    );
  } catch (error) {
    console.error('Error fetching trip:', error);
    notFound();
  }
}
