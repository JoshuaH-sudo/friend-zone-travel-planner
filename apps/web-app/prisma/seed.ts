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
  const [mikeFriend, sarahFriend] = await Promise.all([
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

  const [tomFriend, emmaFriend] = await Promise.all([
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
                {
                  location: 'Paris, France',
                  latitude: 48.8566,
                  longitude: 2.3522,
                  order: 0,
                  friends: {
                    connect: [{ id: mikeFriend.id }]
                  }
                },
                {
                  location: 'Amsterdam, Netherlands',
                  latitude: 52.3676,
                  longitude: 4.9041,
                  order: 1,
                  friends: {
                    connect: [{ id: sarahFriend.id }]
                  }
                },
                {
                  location: 'Brussels, Belgium',
                  latitude: 50.8503,
                  longitude: 4.3517,
                  order: 2,
                  friends: {
                    connect: [{ id: mikeFriend.id }, { id: sarahFriend.id }]
                  }
                },
              ],
            },
          },
          {
            name: 'Mediterranean Tour',
            Destinations: {
              create: [
                {
                  location: 'Rome, Italy',
                  latitude: 41.9028,
                  longitude: 12.4964,
                  order: 0,
                  friends: {
                    connect: [{ id: sarahFriend.id }]
                  }
                },
                {
                  location: 'Barcelona, Spain',
                  latitude: 41.3851,
                  longitude: 2.1734,
                  order: 1,
                  friends: {
                    connect: [{ id: mikeFriend.id }]
                  }
                },
                {
                  location: 'Athens, Greece',
                  latitude: 37.9838,
                  longitude: 23.7275,
                  order: 2,
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
      userId: jane.id,
      routes: {
        create: [
          {
            name: 'East Asia Tour',
            Destinations: {
              create: [
                {
                  location: 'Tokyo, Japan',
                  latitude: 35.6895,
                  longitude: 139.6917,
                  order: 0,
                  friends: {
                    connect: [{ id: tomFriend.id }]
                  }
                },
                {
                  location: 'Seoul, South Korea',
                  latitude: 37.5665,
                  longitude: 126.978,
                  order: 1,
                  friends: {
                    connect: [{ id: emmaFriend.id }]
                  }
                },
                {
                  location: 'Beijing, China',
                  latitude: 39.9042,
                  longitude: 116.4074,
                  order: 2,
                  friends: {
                    connect: [{ id: tomFriend.id }, { id: emmaFriend.id }]
                  }
                },
              ],
            },
          },
          {
            name: 'Southeast Asia Tour',
            Destinations: {
              create: [
                {
                  location: 'Bangkok, Thailand',
                  latitude: 13.7563,
                  longitude: 100.5018,
                  order: 0,
                  friends: {
                    connect: [{ id: emmaFriend.id }]
                  }
                },
                {
                  location: 'Singapore',
                  latitude: 1.3521,
                  longitude: 103.8198,
                  order: 1,
                  friends: {
                    connect: [{ id: tomFriend.id }]
                  }
                },
                {
                  location: 'Bali, Indonesia',
                  latitude: -8.4095,
                  longitude: 115.1889,
                  order: 2,
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
