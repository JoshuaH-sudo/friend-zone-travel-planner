"use client";
import { useEffect, useState } from "react";
import { useDatabase } from "@/lib/DatabaseProvider";
import { useParams } from "next/navigation";
import { Stop } from "./components/Stop";
import { TripStats } from "./components/TripStats";
import { StopItems } from "./components/StopItems";
import { Timeline } from "./components/Timeline";
import { TripNameEditor } from "./components/TripNameEditor";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dot, MapPin } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Plus } from "@hugeicons/core-free-icons";
import { useTripData } from "@/components/hooks/useTripData";
import { exportTripToIcal } from "@/lib/ical-export";
import { useSettings } from "@/lib/SettingsProvider";

function TripDetails() {
  const params = useParams();
  const tripId = params.tripId as string;
  const database = useDatabase();
  const { timezone } = useSettings();
  const [pendingNewStopId, setPendingNewStopId] = useState<string | null>(
    null,
  );
  const tripData = useTripData(tripId, { database });
  const { trip, stops, accommodationsByStop, transportsByStop, loading } =
    tripData;

  useEffect(() => {
    if (!pendingNewStopId) return;

    const createdStopExists = stops.some((stop) => stop.id === pendingNewStopId);
    if (!createdStopExists) return;

    document
      .getElementById(`stop-${pendingNewStopId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });

    setPendingNewStopId(null);
  }, [stops, pendingNewStopId]);

  const updateTripName = async (newName: string) => {
    if (!trip) return;
    await trip.patch({ name: newName });
  };

  const exportTrip = async () => {
    await exportTripToIcal(database, tripId, timezone);
  };

  const addStop = async () => {
    const { generateId } = await import("@/lib/rxdb-database");
    const newStopId = generateId();

    // Find the latest date from stops, accommodations, and transports
    let latestDate = new Date().toISOString().split("T")[0];
    const allDates: string[] = [];

    // Collect all stop dates
    stops.forEach((stop) => allDates.push(stop.date));

    // Collect all accommodation checkout dates
    Object.values(accommodationsByStop)
      .flat()
      .forEach((acc) => {
        allDates.push(acc.checkOut);
      });

    // Collect all transport dates
    Object.values(transportsByStop)
      .flat()
      .forEach((trans) => {
        allDates.push(trans.date);
      });

    // Find the maximum date
    if (allDates.length > 0) {
      latestDate = allDates.reduce((max, date) => (date > max ? date : max));
    }

    await database.stops.insert({
      id: newStopId,
      name: `New Stop ${stops.length + 1}`,
      date: latestDate,
      tripId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    setPendingNewStopId(newStopId);
  };

  const onAddAccommodation = async (stopId: string) => {
    const stop = stops.find((s) => s.id === stopId);
    if (!stop) return;

    const { generateId } = await import("@/lib/rxdb-database");
    await database.accommodations.insert({
      id: generateId(),
      name: "New Accommodation",
      price: 0,
      currency: "USD",
      checkIn: stop.date || new Date().toISOString().split("T")[0],
      checkOut: stop.date || new Date().toISOString().split("T")[0],
      stopId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  const onAddTransport = async (stopId: string) => {
    const stop = stops.find((s) => s.id === stopId);
    if (!stop) return;

    const { generateId } = await import("@/lib/rxdb-database");
    await database.transports.insert({
      id: generateId(),
      name: "New Transport",
      type: "flight",
      price: 0,
      currency: "USD",
      departureDateTime: `${stop.date || new Date().toISOString().split("T")[0]}T12:00`,
      stopId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading trip...
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Trip not found
      </div>
    );
  }

  return (
    <main className="flex min-h-screen max-w-4xl m-auto flex-col items-center px-2 sm:items-start">
      <TripNameEditor
        tripName={trip.name}
        onSave={updateTripName}
        onExport={exportTrip}
      />
      <Separator className="my-6" />
      <TripStats tripId={tripId} tripData={tripData} />
      <Separator className="my-6 mb-4" />
      <div className="flex items-center justify-end gap-4 w-full mb-4">
        <Button onClick={addStop}>
          Add Stop <HugeiconsIcon icon={Plus} className="ml-2" />
        </Button>
      </div>
      <section id="stops-section" className="w-full text-left">
        {stops.length > 0 && (
          <Timeline
            className="pl-4"
            lineClassName="absolute top-4 bottom-1 left-4 border-l-2"
            endMarker={
              <div className="bg-background border-primary absolute -bottom-2 left-4 flex size-4 -translate-x-1/2 items-center justify-center rounded-full border-2">
                <Dot className="text-foreground h-8 w-8" />
              </div>
            }
          >
            <ul className="space-y-8">
              {stops.map((stop) => {
                const accommodations = accommodationsByStop[stop.id] || [];
                const transports = transportsByStop[stop.id] || [];

                return (
                  <li id={`stop-${stop.id}`} key={stop.id} className="relative pl-8">
                    <div className="flex w-full items-center gap-4">
                      {/* Icon */}
                      <div className="border-primary bg-background absolute top-3 left-px mb-3 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border-2">
                        <MapPin className="h-5 w-5" />
                      </div>

                      {/* Stop content */}
                      <Stop
                        stop={stop}
                        startInEditMode={pendingNewStopId === stop.id}
                      />
                    </div>
                    <StopItems
                      transports={transports}
                      accommodations={accommodations}
                      stop={stop}
                      onAddAccommodation={onAddAccommodation}
                      onAddTransport={onAddTransport}
                    />
                  </li>
                );
              })}
            </ul>
          </Timeline>
        )}
        <Button className="mt-6 w-full" onClick={addStop}>
          Add Stop <HugeiconsIcon icon={Plus} className="ml-2" />
        </Button>
      </section>
    </main>
  );
}

export default TripDetails;
