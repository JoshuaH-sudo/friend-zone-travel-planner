"use client";
import { useState } from "react";

const DUMMY_TRIP = {
  id: "1",
  name: "Japan Trip",
  stops: [
    {
      id: "1",
      name: "Tokyo",
      date: "2024-01-01",
    },
    {
      id: "2",
      name: "Kyoto",
      date: "2024-01-05",
    },
    {
      id: "3",
      name: "Osaka",
      date: "2024-01-10",
    },
  ],
};
export default function Home() {
  const [trip, setTrip] = useState(DUMMY_TRIP);
  const addStop = () => {
    const newStop = {
      id: (trip.stops.length + 1).toString(),
      name: `New Stop ${trip.stops.length + 1}`,
      date: new Date().toISOString().split("T")[0],
    };
    setTrip({
      ...trip,
      stops: [...trip.stops, newStop],
    });
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-[5rem]">
          {trip.name}
        </h1>
        <div className="mt-10 w-full rounded-xl border p-6 text-left">
          <h2 className="text-2xl font-bold mb-4">Stops</h2>
          <ul className="space-y-4">
            {trip.stops.map((stop) => (
              <li key={stop.id} className="border rounded-lg p-4">
                <h3 className="text-xl font-semibold">{stop.name}</h3>
                <p className="text-gray-600">
                  {new Date(stop.date).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
          <button
            className="mt-6 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={addStop}
          >
            Add Stop
          </button>
        </div>
      </main>
    </div>
  );
}
