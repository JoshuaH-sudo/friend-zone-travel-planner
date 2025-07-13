import prisma from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-utils';
import TripOverviewClient from './components/tripOverviewClient';
import { redirect } from 'next/navigation';

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
  const userId = await getCurrentUserId();
  
  if (!userId) {
    redirect('/login');
  }

  const trip = await prisma.trip.findFirst({
    where: {
      userId: userId,
      id: tripId,
    },
  });
  const routes = await prisma.route.findMany({
    where: {
      tripId: tripId,
    },
  });

  if (!trip) {
    return <div className='text-red-500'>Trip not found</div>;
  }

  return <TripOverviewClient trip={trip} routes={routes} tripId={tripId} />;
}
