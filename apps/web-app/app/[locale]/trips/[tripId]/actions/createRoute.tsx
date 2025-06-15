'use server';

import prisma from '@/lib/db';
import { redirect } from 'next/dist/server/api-utils';

const createRoute = async (tripId: number) => {
  return await prisma.route.create({
    data: {
      name: 'New Route',
      tripId: tripId,
    },
  });
};

export default createRoute;
