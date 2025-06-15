'use server';

import prisma from '@/lib/db';

const createRoute = async (tripId: number) => {
  await prisma.route.create({
    data: {
      name: 'New Route',
      tripId: tripId,
    },
  });
};

export default createRoute;
