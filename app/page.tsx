"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useDatabase } from "@/lib/DatabaseProvider";
import { seedDatabase } from "@/lib/seedDatabase";

function TripList() {
  const database = useDatabase();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, [database]);

  const loadTrips = async () => {
    const allTrips = await database.trips.find().exec();
    setTrips(allTrips);
    setLoading(false);
  };

  const createSampleTrips = async () => {
    await seedDatabase();
    await loadTrips();
  };

  if (loading) {
    return <div>Loading trips...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Your Trips</h2>
      {trips.length === 0 ? (
        <div className="mt-4">
          <p className="text-gray-600 dark:text-gray-400">No trips yet.</p>
          <button
            onClick={createSampleTrips}
            className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Create Sample Trips
          </button>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {trips.map((trip: any) => (
            <Link key={trip.id} href={`/trip/${trip.id}`} className="block">
              <li className="rounded-md bg-gray-100 p-4 dark:bg-gray-800">
                {trip.name}
              </li>
            </Link>
          ))}
        </ul>
      )}
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
