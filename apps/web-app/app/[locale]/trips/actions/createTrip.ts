'use server';

import prisma from '@/lib/db';
import { DUMMY_LOGIN_USER_ID } from '@/lib/constants';

const createTrip = async () => {
  // Set default dates (start: today, end: one week from today)
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 7);

  return prisma.trip.create({
    data: {
      name: 'New Trip',
      startDate: startDate,
      endDate: endDate,
      userId: DUMMY_LOGIN_USER_ID,
    },
  });
};

export default createTrip;
