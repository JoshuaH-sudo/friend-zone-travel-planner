"use client";

import Link from "next/link";
import { Suspense } from "react";

const DUMMY_TRIPS = [
  { id: "1", name: "Trip to Paris" },
  { id: "2", name: "Weekend in New York" },
  { id: "3", name: "Beach Vacation in Hawaii" },
];

async function TripList() {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate loading delay
  return (
    <div>
      <h2 className="text-2xl font-bold">Your Trips</h2>
      <ul className="mt-4 space-y-2">
        {DUMMY_TRIPS.map((trip) => (
          <Link key={trip.id} href={`/trip/${trip.id}`} className="block">
            <li
              key={trip.id}
              className="rounded-md bg-gray-100 p-4 dark:bg-gray-800"
            >
              {trip.name}
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center gap-4 bg-white px-6 py-20 sm:items-start dark:bg-black">
        <h1 className="text-2xl font-bold">Friend Zone Travel Planner</h1>
        <Suspense fallback={<div>Loading trips...</div>}>
          <TripList />
        </Suspense>
      </main>
    </div>
  );
}
