import prisma from '@/lib/db';
import { DUMMY_LOGIN_USER_ID } from '@/lib/constants';
import Link from 'next/link';

export default async function TripsPage() {
  const trips = await prisma.trip.findMany({
    where: {
      userId: DUMMY_LOGIN_USER_ID,
    },
  });
  return (
    <main className='mx-auto max-w-7xl px-4 py-8'>
      <h1 className='mb-2'>Trips</h1>

      <div className='flex flex-col gap-4 bg-slate-800 p-4 text-white'>
        {trips.map((trip) => (
          <div key={trip.id}>
            <h2>{trip.name}</h2>
            <Link href={`trips/${trip.id}`}>
              <p>Details</p>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
