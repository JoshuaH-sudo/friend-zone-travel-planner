"use client";

import Link from "next/link";
import { getDatabase, MyDatabase } from "@/lib/rxdb-database";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TripDocument } from "@/lib/rxdb-schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { PlusIcon } from "lucide-react";
import { TripStats } from "./trip/[tripId]/components/TripStats";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, CalendarDownload01Icon } from "@hugeicons/core-free-icons";
import { exportTripToIcal } from "@/lib/ical-export";

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

  const exportTrip = async (tripId: string) => {
    if (!database) return;
    await exportTripToIcal(database, tripId);
  };

  return (
    <div>
      <span className="flex justify-between">
        <h2 className="text-2xl font-bold">Your Trips</h2>
        <Button
          variant="outline"
          className="bg-accent text-accent-foreground"
          onClick={createTrip}
        >
          Add Trip
          <PlusIcon />
        </Button>
      </span>

      <ul className="mt-4 space-y-2">
        {trips.map((trip) => (
          <Card key={trip.id}>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-4">
                <Link
                  href={`/trip/${trip.id}`}
                  className="flex-1 text-4xl font-bold hover:text-blue-400 hover:underline"
                >
                  {trip.name}
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 focus-visible:border-primary"
                    aria-label="Export trip to iCal"
                    onClick={() => exportTrip(trip.id)}
                  >
                    <HugeiconsIcon icon={CalendarDownload01Icon} />
                  </Button>
                  <ConfirmationDialog
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 focus-visible:border-destructive/40"
                        aria-label="Delete trip"
                      >
                        <HugeiconsIcon icon={Cancel01Icon} />
                      </Button>
                    }
                    title="Delete this trip?"
                    description={`This will permanently remove ${trip.name} and all of its trip data.`}
                    confirmLabel="Delete trip"
                    onConfirm={() => deleteTrip(trip.id)}
                  >
                    <p className="text-muted-foreground text-sm">
                      This action cannot be undone.
                    </p>
                  </ConfirmationDialog>
                </div>
              </div>
              <TripStats tripId={trip.id} />
            </CardContent>
          </Card>
        ))}

        <li>
          <Button
            variant="outline"
            className="bg-accent text-accent-foreground w-full"
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
