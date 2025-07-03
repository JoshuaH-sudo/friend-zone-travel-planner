import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

// Type for the trips data with all nested relations
type TripWithRoutes = Prisma.TripGetPayload<{
  include: {
    routes: {
      include: {
        destinations: {
          include: {
            friends: true;
          };
        };
      };
    };
  };
}>;

// Type for the formatted response data
type TripResponse = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  routes: {
    id: number;
    name: string;
    destinationCount: number;
    friendCount: number;
    destinations: {
      id: number;
      location: string;
      latitude: number;
      longitude: number;
      order: number;
    }[];
  }[];
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const trips = await prisma.trip.findMany({
      where: {
        userId: parseInt(userId, 10),
      },
      include: {
        routes: {
          include: {
            destinations: {
              include: {
                friends: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    }) as TripWithRoutes[];

    const tripsWithRoutes: TripResponse[] = trips.map((trip) => ({
      id: trip.id,
      name: trip.name,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      routes: trip.routes.map((route) => ({
        id: route.id,
        name: route.name,
        destinationCount: route.destinations.length,
        friendCount: route.destinations.reduce(
          (total, dest) => total + dest.friends.length,
          0
        ),
        destinations: route.destinations.map((dest) => ({
          id: dest.id,
          location: dest.location,
          latitude: dest.latitude,
          longitude: dest.longitude,
          order: dest.order,
        })),
      })),
    }));

    return NextResponse.json(tripsWithRoutes);
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}
