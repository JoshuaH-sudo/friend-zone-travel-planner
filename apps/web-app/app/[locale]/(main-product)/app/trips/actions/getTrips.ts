'use server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function getTrips() {
  const session = await auth();
  console.log('Session:', session);
  if (!session || !session.user || !session.user.id) {
    throw new Error('Unauthorized');
  }
  return prisma.trip.findMany({
    where: { userId: session!.user!.id! },
    include: {
      routes: {
        include: {
          destinations: {
            select: {
              id: true,
              location: true,
              latitude: true,
              longitude: true,
              order: true,
            },
          },
        },
      },
    },
  });
}
