import prisma from '@/lib/db';
import { DUMMY_LOGIN_USER_ID } from '@/lib/constants';
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
  const trip = await prisma.trip.findFirst({
    where: {
      userId: DUMMY_LOGIN_USER_ID,
      id: parseInt(tripId, 10),
    },
  });
  const routes = await prisma.route.findMany({
    where: {
      tripId: parseInt(tripId, 10),
    },
  });

  if (!trip) {
    return <div className='text-red-500'>Trip not found</div>;
  }

  return <TripOverviewClient trip={trip} routes={routes} tripId={tripId} />;
}
