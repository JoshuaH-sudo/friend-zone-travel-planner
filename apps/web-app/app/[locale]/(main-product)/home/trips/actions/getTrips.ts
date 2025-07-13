'use server';
import prisma from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-utils';

export async function getTrips(userId?: string) {
  // If no userId provided, get from session
  const currentUserId = userId || await getCurrentUserId();
  
  if (!currentUserId) {
    throw new Error('User not authenticated');
  }

  return prisma.trip.findMany({
    where: { userId: currentUserId },
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
