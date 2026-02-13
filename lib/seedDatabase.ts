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
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create stops for Japan Trip
    const tokyoStopId = generateId();
    await database.stops.insert({
      id: tokyoStopId,
      name: "Tokyo",
      date: "2024-01-01",
      tripId: trip1Id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const kyotoStopId = generateId();
    await database.stops.insert({
      id: kyotoStopId,
      name: "Kyoto",
      date: "2024-01-05",
      tripId: trip1Id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const osakaStopId = generateId();
    await database.stops.insert({
      id: osakaStopId,
      name: "Osaka",
      date: "2024-01-10",
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
      checkIn: "2024-01-01",
      checkOut: "2024-01-05",
      stopId: tokyoStopId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await database.accommodations.insert({
      id: generateId(),
      name: "Tokyo Hostel",
      price: 50,
      currency: "USD",
      checkIn: "2024-01-01",
      checkOut: "2024-01-05",
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
      date: "2024-01-01",
      stopId: tokyoStopId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create accommodations for Kyoto
    await database.accommodations.insert({
      id: generateId(),
      name: "Kyoto Inn",
      price: 80,
      currency: "USD",
      checkIn: "2024-01-05",
      checkOut: "2024-01-10",
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
      date: "2024-01-05",
      stopId: kyotoStopId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create accommodations for Osaka
    await database.accommodations.insert({
      id: generateId(),
      name: "Osaka Hotel",
      price: 90,
      currency: "USD",
      checkIn: "2024-01-10",
      checkOut: "2024-01-15",
      stopId: osakaStopId,
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
