'use server';
import prisma from '@/lib/db';
import { NewDestination } from '../components/addDestinationForm';

const addDestination = async (data: NewDestination) => {
  await prisma.destination.create({
    data: {
      ...data,
    },
  });
};

export default addDestination;
