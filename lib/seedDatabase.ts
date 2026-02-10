import { database } from "./database";

export async function seedDatabase() {
  try {
    // Check if there are already trips
    const trips = await database.get("trips").query().fetch();
    if (trips.length > 0) {
      console.log("Database already has data");
      return;
    }

    await database.write(async () => {
      // Create first trip
      const trip1 = await database.get("trips").create((trip: any) => {
        trip.name = "Japan Trip";
      });

      // Create stops for Japan Trip
      const tokyoStop = await database.get("stops").create((stop: any) => {
        stop.name = "Tokyo";
        stop.date = "2024-01-01";
        stop.tripId = trip1.id;
      });

      const kyotoStop = await database.get("stops").create((stop: any) => {
        stop.name = "Kyoto";
        stop.date = "2024-01-05";
        stop.tripId = trip1.id;
      });

      const osakaStop = await database.get("stops").create((stop: any) => {
        stop.name = "Osaka";
        stop.date = "2024-01-10";
        stop.tripId = trip1.id;
      });

      // Create accommodations for Tokyo
      await database.get("accommodations").create((acc: any) => {
        acc.name = "Hotel Tokyo";
        acc.price = 100;
        acc.currency = "USD";
        acc.checkIn = "2024-01-01";
        acc.checkOut = "2024-01-05";
        acc.stopId = tokyoStop.id;
      });

      await database.get("accommodations").create((acc: any) => {
        acc.name = "Tokyo Hostel";
        acc.price = 50;
        acc.currency = "USD";
        acc.checkIn = "2024-01-01";
        acc.checkOut = "2024-01-05";
        acc.stopId = tokyoStop.id;
      });

      // Create transport for Tokyo
      await database.get("transports").create((trans: any) => {
        trans.name = "Flight to Tokyo";
        trans.type = "flight";
        trans.price = 500;
        trans.currency = "USD";
        trans.date = "2024-01-01";
        trans.stopId = tokyoStop.id;
      });

      // Create accommodations for Kyoto
      await database.get("accommodations").create((acc: any) => {
        acc.name = "Kyoto Inn";
        acc.price = 80;
        acc.currency = "USD";
        acc.checkIn = "2024-01-05";
        acc.checkOut = "2024-01-10";
        acc.stopId = kyotoStop.id;
      });

      // Create transport for Kyoto
      await database.get("transports").create((trans: any) => {
        trans.name = "Train to Kyoto";
        trans.type = "bus";
        trans.price = 150;
        trans.currency = "USD";
        trans.date = "2024-01-05";
        trans.stopId = kyotoStop.id;
      });

      // Create accommodations for Osaka
      await database.get("accommodations").create((acc: any) => {
        acc.name = "Osaka Hotel";
        acc.price = 90;
        acc.currency = "USD";
        acc.checkIn = "2024-01-10";
        acc.checkOut = "2024-01-15";
        acc.stopId = osakaStop.id;
      });

      // Create other sample trips
      await database.get("trips").create((trip: any) => {
        trip.name = "Trip to Paris";
      });

      await database.get("trips").create((trip: any) => {
        trip.name = "Weekend in New York";
      });

      await database.get("trips").create((trip: any) => {
        trip.name = "Beach Vacation in Hawaii";
      });
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
