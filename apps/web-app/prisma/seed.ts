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
                { location: 'Paris, France' },
                { location: 'Amsterdam, Netherlands' },
                { location: 'Brussels, Belgium' },
              ],
            },
          },
          {
            name: 'Mediterranean Tour',
            Destinations: {
              create: [
                { location: 'Rome, Italy' },
                { location: 'Barcelona, Spain' },
                { location: 'Athens, Greece' },
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
                { location: 'Tokyo, Japan' },
                { location: 'Seoul, South Korea' },
                { location: 'Beijing, China' },
              ],
            },
          },
          {
            name: 'Southeast Asia Tour',
            Destinations: {
              create: [
                { location: 'Bangkok, Thailand' },
                { location: 'Singapore' },
                { location: 'Bali, Indonesia' },
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
