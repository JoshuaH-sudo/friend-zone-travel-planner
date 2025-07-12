import { PrismaClient } from '@prisma/client';

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
      passwordHash: '$2b$10$eImiTMZG8rj1zQ9a5h6eOeO5k1Z3f4d7g8h9j0k1l2m3n4o5p6q7r8s9t0',
      email: 'john@example.com',
      location: 'New York, USA',
    },
  });

  const jane = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      passwordHash: '$2b$10$eImiTMZG8rj1zQ9a5h6eOeO5k1Z3f4d7g8h9j0k1l2m3n4o5p6q7r8s9t0',
      email: 'jane@example.com',
      location: 'London, UK',
    },
  });

  // Create Friends
  const [mikeFriend, sarahFriend] = await Promise.all([
    prisma.friend.create({
      data: {
        name: 'Mike Johnson',
        location: 'Los Angeles, USA',
        latitude: 34.0522,
        longitude: -118.2437,
        userId: john.id,
      },
    }),
    prisma.friend.create({
      data: {
        name: 'Sarah Wilson',
        location: 'Sydney, Australia',
        latitude: -33.8688,
        longitude: 151.2093,
        userId: john.id,
      },
    }),
  ]);

  const [tomFriend, emmaFriend] = await Promise.all([
    prisma.friend.create({
      data: {
        name: 'Tom Brown',
        location: 'Toronto, Canada',
        latitude: 43.6532,
        longitude: -79.3832,
        userId: jane.id,
      },
    }),
    prisma.friend.create({
      data: {
        name: 'Emma Davis',
        location: 'Berlin, Germany',
        latitude: 52.5200,
        longitude: 13.4050,
        userId: jane.id,
      },
    }),
  ]);

  // Create Trips with Routes and destinations
  await prisma.trip.create({
    data: {
      name: 'European Adventure',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-08-15'),
      userId: john.id,
      routes: {
        create: [
          {
            name: 'Western Europe Tour',
            
            destinations: {
              create: [
                {
                  location: 'Paris, France',
                  latitude: 48.8566,
                  longitude: 2.3522,
                  order: 0,
                  startDate: new Date('2025-07-01'),
                  endDate: new Date('2025-07-05'),
                  friends: {
                    connect: [{ id: mikeFriend.id }]
                  }
                },
                {
                  location: 'Amsterdam, Netherlands',
                  latitude: 52.3676,
                  longitude: 4.9041,
                  order: 1,
                  startDate: new Date('2025-07-06'),
                  endDate: new Date('2025-07-10'),
                  friends: {
                    connect: [{ id: sarahFriend.id }]
                  }
                },
                {
                  location: 'Brussels, Belgium',
                  latitude: 50.8503,
                  longitude: 4.3517,
                  order: 2,
                  startDate: new Date('2025-07-11'),
                  endDate: new Date('2025-07-15'),
                  friends: {
                    connect: [{ id: mikeFriend.id }, { id: sarahFriend.id }]
                  }
                },
              ],
            },
          },
          {
            name: 'Mediterranean Tour',
            destinations: {
              create: [
                {
                  location: 'Rome, Italy',
                  latitude: 41.9028,
                  longitude: 12.4964,
                  order: 0,
                  startDate: new Date('2025-08-01'),
                  endDate: new Date('2025-08-05'),
                  friends: {
                    connect: [{ id: sarahFriend.id }]
                  }
                },
                {
                  location: 'Barcelona, Spain',
                  latitude: 41.3851,
                  longitude: 2.1734,
                  order: 1,
                  startDate: new Date('2025-08-06'),
                  endDate: new Date('2025-08-10'),
                  friends: {
                    connect: [{ id: mikeFriend.id }]
                  }
                },
                {
                  location: 'Athens, Greece',
                  latitude: 37.9838,
                  longitude: 23.7275,
                  order: 2,
                  startDate: new Date('2025-08-11'),
                  endDate: new Date('2025-08-15'),
                  friends: {
                    connect: [{ id: mikeFriend.id }, { id: sarahFriend.id }]
                  }
                },
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
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-10-15'),
      userId: jane.id,
      routes: {
        create: [
          {
            name: 'East Asia Tour',
            destinations: {
              create: [
                {
                  location: 'Tokyo, Japan',
                  latitude: 35.6895,
                  longitude: 139.6917,
                  order: 0,
                  startDate: new Date('2025-09-01'),
                  endDate: new Date('2025-09-05'),
                  friends: {
                    connect: [{ id: tomFriend.id }]
                  }
                },
                {
                  location: 'Seoul, South Korea',
                  latitude: 37.5665,
                  longitude: 126.978,
                  order: 1,
                  startDate: new Date('2025-09-06'),
                  endDate: new Date('2025-09-10'),
                  friends: {
                    connect: [{ id: emmaFriend.id }]
                  }
                },
                {
                  location: 'Beijing, China',
                  latitude: 39.9042,
                  longitude: 116.4074,
                  order: 2,
                  startDate: new Date('2025-09-11'),
                  endDate: new Date('2025-09-15'),
                  friends: {
                    connect: [{ id: tomFriend.id }, { id: emmaFriend.id }]
                  }
                },
              ],
            },
          },
          {
            name: 'Southeast Asia Tour',
            destinations: {
              create: [
                {
                  location: 'Bangkok, Thailand',
                  latitude: 13.7563,
                  longitude: 100.5018,
                  order: 0,
                  startDate: new Date('2025-10-01'),
                  endDate: new Date('2025-10-05'),
                  friends: {
                    connect: [{ id: emmaFriend.id }]
                  }
                },
                {
                  location: 'Singapore',
                  latitude: 1.3521,
                  longitude: 103.8198,
                  order: 1,
                  startDate: new Date('2025-10-06'),
                  endDate: new Date('2025-10-10'),
                  friends: {
                    connect: [{ id: tomFriend.id }]
                  }
                },
                {
                  location: 'Bali, Indonesia',
                  latitude: -8.4095,
                  longitude: 115.1889,
                  order: 2,
                  startDate: new Date('2025-10-11'),
                  endDate: new Date('2025-10-15'),
                  friends: {
                    connect: [{ id: tomFriend.id }, { id: emmaFriend.id }]
                  }
                },
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
