"use client";

import Link from "next/link";
import { getDatabase, MyDatabase } from "@/lib/rxdb-database";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TripDocument } from "@/lib/rxdb-schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { TripStats } from "./trip/[tripId]/components/TripStats";

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
          <Card key={trip.id}>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-4">
                <Link
                  href={`/trip/${trip.id}`}
                  className="flex-1 hover:text-blue-400 hover:underline font-bold text-4xl"
                >
                  {trip.name}
                </Link>
                <Button
                  onClick={() => deleteTrip(trip.id)}
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete trip"
                >
                  ✕
                </Button>
              </div>
              <TripStats tripId={trip.id} />
            </CardContent>
          </Card>
        ))}

        <li>
          <Button
            variant="outline"
            className="w-full bg-accent text-accent-foreground"
            onClick={createTrip}
          >
            Add Trip
            <PlusIcon />
          </Button>
        </li>
      </ul>
    </div>
  );
}

export default function Home() {
  return <TripList />;
}
