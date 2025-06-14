import prisma from '@/lib/db';
import { DUMMY_LOGIN_USER_ID } from '../page';
import { TripRouteParams } from './types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

  return (
    <main className='mx-auto max-w-7xl px-4 py-8'>
      <h1 className='mb-2'>Trip details</h1>

      <div className='flex flex-col gap-4 bg-slate-800 p-4 text-white'>
        <div key={trip.id}>
          {routes.map((route) => (
            <div key={route.id}>
              <h3>{route.name}</h3>
              <p className='text-sm font-light text-blue-500 hover:cursor-pointer hover:text-blue-300'>
                Details for route {route.id}
              </p>
            </div>
          ))}
          <Link href={`/trips/${tripId}/new-route`}>
            <Button>Add Route</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
