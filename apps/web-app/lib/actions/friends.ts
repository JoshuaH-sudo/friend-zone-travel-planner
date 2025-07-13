'use server';

import prisma from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-utils';

export interface GetFriendsByGeoLocationProps {
  lat: number;
  lng: number;
}
export const getFriendsByGeoLocation = async ({
  lat,
  lng,
}: GetFriendsByGeoLocationProps) => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  return await prisma.friend.findMany({
    where: {
      userId: userId,
      latitude: {
        gte: lat - 0.1,
        lte: lat + 0.1,
      },
      longitude: {
        gte: lng - 0.1,
        lte: lng + 0.1,
      },
    },
    select: {
      id: true,
      name: true,
      location: true,
      latitude: true,
      longitude: true,
    },
  });
};
