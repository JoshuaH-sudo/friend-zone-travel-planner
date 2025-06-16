'use server';

import prisma from '../db';

export async function getDestinationsByRouteId(routeId: number) {
  return prisma.destination.findMany({
    where: { routeId },
    orderBy: { order: 'asc' },
  });
}

export interface addDestinationToRouteProps {
  routeId: number;
  location: string;
}
export async function addDestinationToRoute({
  routeId,
  location,
}: addDestinationToRouteProps) {
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
      routeId,
      order: newOrder,
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
