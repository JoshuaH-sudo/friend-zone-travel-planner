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

    const newTrip = await database.trips.insert({
      id: crypto.randomUUID(),
      name: "New Trip",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    console.log("Created new trip:", newTrip);
    router.push(`/trip/${newTrip.id}`);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Your Trips</h2>

      <ul className="mt-4 space-y-2">
        {trips.map((trip) => (
          <Link key={trip.id} href={`/trip/${trip.id}`} className="block">
            <li className="rounded-md bg-gray-100 p-4 dark:bg-gray-800">
              {trip.name}
            </li>
          </Link>
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
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center gap-4 bg-white px-6 py-20 sm:items-start dark:bg-black">
        <h1 className="text-2xl font-bold">Friend Zone Travel Planner</h1>
        <TripList />
      </main>
    </div>
  );
}
