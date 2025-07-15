'use server';

import prisma from '@/lib/db';

const updateRoute = async (routeId: string, name: string) => {
  return await prisma.route.update({
    where: {
      id: routeId,
    },
    data: {
      name: name,
    },
  });
};

export default updateRoute;
