'use server';

import { getAddressCoordinates } from '../actions';
import prisma from '../db';

export async function getDestinationsByRouteId(routeId: number) {
  return prisma.destination.findMany({
    where: { routeId },
    orderBy: { order: 'asc' },
  });
}

export type DestinationResponse = {
  id: number;
  location: string;
  latitude: number;
  longitude: number;
  order: number;
  routeId: number;
};
export interface addDestinationToRouteProps {
  routeId: number;
  location: string;
  friendIds: number[];
}
export async function addDestinationToRoute({
  routeId,
  location,
  friendIds = [],
}: addDestinationToRouteProps) {
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
      location,
      latitude: lat,
      longitude: lng,
      routeId,
      order: newOrder,
      friends: {
        connect: friendIds.map((id) => ({ id })),
      },
    },
  });
}

export async function reorderDestinations(
  routeId: number,
  destinationIds: number[]
) {
  // Update the order of all destinations in the route
  const updates = destinationIds.map((id, index) =>
    prisma.destination.update({
      where: { id },
      data: { order: index },
    })
  );

  return prisma.$transaction(updates);
}
