'use server';

import prisma from '@/lib/db';

export interface GetFriendsByGeoLocationProps {
  lat: number;
  lng: number;
}
export const getFriendsByGeoLocation = async ({
  lat,
  lng,
}: GetFriendsByGeoLocationProps) => {
  return await prisma.friend.findMany({
    where: {
      userId: 1, // TODO: Replace with actual user ID or context
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
