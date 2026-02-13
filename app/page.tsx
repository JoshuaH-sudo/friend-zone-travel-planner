"use client";

import Link from "next/link";
import { getDatabase, MyDatabase } from "@/lib/rxdb-database";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TripDocument } from "@/lib/rxdb-schema";

function TripList() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripDocument[]>([]);
  const [database, setDatabase] = useState<MyDatabase | null>(null);

  useEffect(() => {
    const fetchDatabase = async () => {
      const db = await getDatabase();
      setDatabase(db);
    };
    fetchDatabase();
  }, []);

  useEffect(() => {
    if (!database) return;

    const subscription = database.trips.find().$.subscribe((newTrips) => {
      setTrips(newTrips);
    });

    return () => subscription.unsubscribe();
  }, [database]);

  const createTrip = async () => {
    if (!database) return;

    const { generateId } = await import("@/lib/rxdb-database");
    const newTrip = await database.trips.insert({
      id: generateId(),
      name: "New Trip",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    console.log("Created new trip:", newTrip);
    router.push(`/trip/${newTrip.id}`);
  };

  const deleteTrip = async (tripId: string) => {
    if (!database) return;

    const trip = await database.trips.findOne(tripId).exec();
    if (trip) {
      await trip.remove();
      console.log("Deleted trip:", tripId);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Your Trips</h2>

      <ul className="mt-4 space-y-2">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="relative flex items-center justify-between gap-4 rounded-md bg-gray-100 p-4 dark:bg-gray-800"
          >
            <Link
              href={`/trip/${trip.id}`}
              className="block hover:text-blue-400 hover:underline"
            >
              <li className="">{trip.name}</li>
            </Link>
            <button
              onClick={() => deleteTrip(trip.id)}
              className="text-sm text-gray-400 hover:text-red-600"
              aria-label="Delete trip"
              type="button"
            >
              ✕
            </button>
          </div>
        ))}

        <li>
          <button
            className="rounded-md bg-gray-100 p-4 dark:bg-gray-800"
            onClick={createTrip}
          >
            Add Trip
          </button>
        </li>
      </ul>
    </div>
  );
}

export default function Home() {
  return <TripList />;
}
