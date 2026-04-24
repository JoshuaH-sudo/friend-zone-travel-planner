import { getDatabase, generateId } from "./rxdb-database";

export async function seedDatabase() {
  try {
    const database = await getDatabase();

    // Check if there are already trips
    const existingTrips = await database.trips.find().exec();
    if (existingTrips.length > 0) {
      console.log("Database already has data");
      return;
    }

    // Create first trip
    const trip1Id = generateId();
    await database.trips.insert({
      id: trip1Id,
      name: "Japan Trip",
      startDate: "2024-01-01",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create stops for Japan Trip
    const tokyoStopId = generateId();
    await database.stops.insert({
      id: tokyoStopId,
      name: "Tokyo",
      tripId: trip1Id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const kyotoStopId = generateId();
    await database.stops.insert({
      id: kyotoStopId,
      name: "Kyoto",
      tripId: trip1Id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const osakaStopId = generateId();
    await database.stops.insert({
      id: osakaStopId,
      name: "Osaka",
      tripId: trip1Id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create accommodations for Tokyo
    await database.accommodations.insert({
      id: generateId(),
      name: "Hotel Tokyo",
      price: 100,
      currency: "USD",
      checkIn: "2024-01-01T14:00",
      checkOut: "2024-01-05T11:00",
      stopId: tokyoStopId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await database.accommodations.insert({
      id: generateId(),
      name: "Tokyo Hostel",
      price: 50,
      currency: "USD",
      checkIn: "2024-01-01T15:00",
      checkOut: "2024-01-05T10:00",
      stopId: tokyoStopId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create transport for Tokyo
    await database.transports.insert({
      id: generateId(),
      name: "Flight to Tokyo",
      type: "flight",
      price: 500,
      currency: "USD",
      departureDateTime: "2024-01-01T12:00",
      stopId: tokyoStopId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create expenses for Tokyo
    await database.expenses.insert({
      id: generateId(),
      tripId: trip1Id,
      stopId: tokyoStopId,
      name: "Sushi dinner",
      price: 40,
      currency: "USD",
      date: "2024-01-02",
      category: "food",
      description: "Dinner at sushi restaurant",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    await database.expenses.insert({
      id: generateId(),
      tripId: trip1Id,
      stopId: tokyoStopId,
      name: "Museum tickets",
      price: 20,
      currency: "USD",
      date: "2024-01-03",
      category: "activity",
      description: "Tickets for museum entry",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create accommodations for Kyoto
    await database.accommodations.insert({
      id: generateId(),
      name: "Kyoto Inn",
      price: 80,
      currency: "USD",
      checkIn: "2024-01-05T14:00",
      checkOut: "2024-01-10T11:00",
      stopId: kyotoStopId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create transport for Kyoto
    await database.transports.insert({
      id: generateId(),
      name: "Train to Kyoto",
      type: "bus",
      price: 150,
      currency: "USD",
      departureDateTime: "2024-01-05T12:00",
      stopId: kyotoStopId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create expenses for Kyoto
    await database.expenses.insert({
      id: generateId(),
      tripId: trip1Id,
      stopId: kyotoStopId,
      name: "Temple entry",
      price: 15,
      currency: "USD",
      date: "2024-01-06",
      category: "activity",
      description: "Entry to temple",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create accommodations for Osaka
    await database.accommodations.insert({
      id: generateId(),
      name: "Osaka Hotel",
      price: 90,
      currency: "USD",
      checkIn: "2024-01-10T14:00",
      checkOut: "2024-01-15T11:00",
      stopId: osakaStopId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create expenses for Osaka
    await database.expenses.insert({
      id: generateId(),
      tripId: trip1Id,
      stopId: osakaStopId,
      name: "Street food",
      price: 25,
      currency: "USD",
      date: "2024-01-11",
      category: "food",
      description: "Various street food snacks",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create other sample trips
    await database.trips.insert({
      id: generateId(),
      name: "Trip to Paris",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await database.trips.insert({
      id: generateId(),
      name: "Weekend in New York",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await database.trips.insert({
      id: generateId(),
      name: "Beach Vacation in Hawaii",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
