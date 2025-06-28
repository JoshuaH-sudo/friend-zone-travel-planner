'use server';

import { getAddressCoordinates } from './google';
import prisma from '../db';

export async function getDestinationsByRouteId(routeId: number) {
  return prisma.destination.findMany({
    where: { routeId },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      location: true,
      latitude: true,
      longitude: true,
      order: true,
      routeId: true,
      startDate: true,
      endDate: true,
      friends: {
        select: {
          id: true,
          name: true,
          location: true,
        },
      },
    },
  });
}

export interface AddDestinationToRouteProps {
  routeId: number;
  location: string;
  friendIds: number[];
  startDate: Date;
  endDate: Date;
}
export type DestinationResponse = {
  id: number;
  location: string;
  latitude: number;
  longitude: number;
  order: number;
  routeId: number;
  startDate: Date;
  endDate: Date;
  friends: {
    id: number;
    name: string;
    location: string;
  }[];
};
export async function addDestinationToRoute({
  routeId,
  location,
  friendIds = [],
  startDate,
  endDate,
}: AddDestinationToRouteProps) {
  const geoData = await getAddressCoordinates(location);
  if (geoData.status !== 'OK') {
    throw new Error(`Failed to get coordinates for location: ${location}`);
  }
  if (!geoData.results) {
    throw new Error(`No results found for location: ${location}`);
  }
  const { lat, lng } = geoData.results.geometry.location;
  // Get the current highest order in the route
  const highestOrder = await prisma.destination.findFirst({
    where: { routeId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  // Create new destination with incremented order
  const newOrder = (highestOrder?.order ?? -1) + 1;

  return prisma.destination.create({
    data: {
      routeId,
      order: newOrder,
      location,
      latitude: lat,
      longitude: lng,
      startDate,
      endDate,
      friends: {
        connect: friendIds.map((id) => ({ id })),
      },
    },
  });
}
