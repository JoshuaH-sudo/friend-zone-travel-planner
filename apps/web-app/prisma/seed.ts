import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.$transaction([
    prisma.destination.deleteMany(),
    prisma.route.deleteMany(),
    prisma.trip.deleteMany(),
    prisma.friend.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create Users
  const john = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      location: 'New York, USA',
    },
  });

  const jane = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      location: 'London, UK',
    },
  });

  // Create Friends
  await Promise.all([
    prisma.friend.create({
      data: {
        name: 'Mike Johnson',
        location: 'Los Angeles, USA',
        userId: john.id,
      },
    }),
    prisma.friend.create({
      data: {
        name: 'Sarah Wilson',
        location: 'Sydney, Australia',
        userId: john.id,
      },
    }),
  ]);

  await Promise.all([
    prisma.friend.create({
      data: {
        name: 'Tom Brown',
        location: 'Toronto, Canada',
        userId: jane.id,
      },
    }),
    prisma.friend.create({
      data: {
        name: 'Emma Davis',
        location: 'Berlin, Germany',
        userId: jane.id,
      },
    }),
  ]);

  // Create Trips with Routes and Destinations
  await prisma.trip.create({
    data: {
      name: 'European Adventure',
      userId: john.id,
      routes: {
        create: [
          {
            name: 'Western Europe Tour',
            Destinations: {
              create: [
                { location: 'Paris, France', order: 0 },
                { location: 'Amsterdam, Netherlands', order: 1 },
                { location: 'Brussels, Belgium', order: 2 },
              ],
            },
          },
          {
            name: 'Mediterranean Tour',
            Destinations: {
              create: [
                { location: 'Rome, Italy', order: 0 },
                { location: 'Barcelona, Spain', order: 1 },
                { location: 'Athens, Greece', order: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.trip.create({
    data: {
      name: 'Asian Explorer',
      userId: jane.id,
      routes: {
        create: [
          {
            name: 'East Asia Tour',
            Destinations: {
              create: [
                { location: 'Tokyo, Japan', order: 0 },
                { location: 'Seoul, South Korea', order: 1 },
                { location: 'Beijing, China', order: 2 },
              ],
            },
          },
          {
            name: 'Southeast Asia Tour',
            Destinations: {
              create: [
                { location: 'Bangkok, Thailand', order: 0 },
                { location: 'Singapore', order: 1 },
                { location: 'Bali, Indonesia', order: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
