'use server';
import prisma from '@/lib/db';
import { NewDestination } from '../components/addDestinationForm';

const addDestination = async (data: NewDestination) => {
  const NewDestination = await prisma.destination.create({
    data: {
      ...data,
    },
  });

  console.log('New destination added:', NewDestination);
  return NewDestination;
};

export default addDestination;
