'use server'

import prisma from '../db'

export async function addDestinationToRoute(routeId: number, location: string) {
  // Get the current highest order in the route
  const highestOrder = await prisma.destination.findFirst({
    where: { routeId },
    orderBy: { order: 'desc' },
    select: { order: true }
  });

  // Create new destination with incremented order
  const newOrder = (highestOrder?.order ?? -1) + 1;

  return prisma.destination.create({
    data: {
      location,
      routeId,
      order: newOrder
    }
  });
}

export async function reorderDestinations(routeId: number, destinationIds: number[]) {
  // Update the order of all destinations in the route
  const updates = destinationIds.map((id, index) => 
    prisma.destination.update({
      where: { id },
      data: { order: index }
    })
  );

  return prisma.$transaction(updates);
}
