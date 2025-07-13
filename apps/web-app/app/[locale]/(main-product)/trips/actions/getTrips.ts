'use server';
import prisma from '@/lib/db';

export async function getTrips(userId: string) {
  return prisma.trip.findMany({
    where: { userId },
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
