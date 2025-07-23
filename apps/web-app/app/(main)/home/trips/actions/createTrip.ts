'use server';

import prisma from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth-utils';

const createTrip = async () => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Set default dates (start: today, end: one week from today)
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 7);

  return prisma.trip.create({
    data: {
      name: 'New Trip',
      startDate: startDate,
      endDate: endDate,
      userId: userId,
    },
  });
};

export default createTrip;
