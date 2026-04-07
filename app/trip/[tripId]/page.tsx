"use client";
import { useState } from "react";
import { useDatabase } from "@/lib/DatabaseProvider";
import { useParams } from "next/navigation";
import { Stop } from "./components/Stop";
import { TripStats } from "./components/TripStats";
import { StopItems } from "./components/StopItems";
import { Timeline } from "./components/Timeline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dot, MapPin } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Plus, Tick02Icon, CalendarDownload01Icon } from "@hugeicons/core-free-icons";
import { useTripData } from "@/components/hooks/useTripData";
import { exportTripToIcal } from "@/lib/ical-export";
import { useSettings } from "@/lib/SettingsProvider";

function TripDetails() {
  const params = useParams();
  const tripId = params.tripId as string;
  const database = useDatabase();
  const { timezone } = useSettings();
  const [isEditingTripName, setIsEditingTripName] = useState(false);
  const [tripNameDraft, setTripNameDraft] = useState("");
  const tripData = useTripData(tripId, { database });
  const { trip, stops, accommodationsByStop, transportsByStop, loading } = tripData;

  const updateTripName = async (newName: string) => {
    if (!trip) return;
    await trip.patch({ name: newName });
  };

  const startEditingTripName = () => {
    if (!trip) return;
    setTripNameDraft(trip.name);
    setIsEditingTripName(true);
  };

  const saveTripName = async () => {
    const trimmedName = tripNameDraft.trim();
    if (!trimmedName || !trip) return;

    await updateTripName(trimmedName);
    setIsEditingTripName(false);
  };

  const cancelTripNameEdit = () => {
    setTripNameDraft(trip?.name ?? "");
    setIsEditingTripName(false);
  };

  const exportTrip = async () => {
    await exportTripToIcal(database, tripId, timezone);
  };

  const addStop = async () => {
    const { generateId } = await import("@/lib/rxdb-database");

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
      id: generateId(),
      name: `New Stop ${stops.length + 1}`,
      date: latestDate,
      tripId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
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
      date: stop.date || new Date().toISOString().split("T")[0],
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
    <main className="flex min-h-screen max-w-4xl flex-col items-center px-2 sm:items-start">
      {isEditingTripName ? (
        <form
          className="flex w-full items-center gap-2"
          onSubmit={async (event) => {
            event.preventDefault();
            await saveTripName();
          }}
        >
          <Input
            type="text"
            value={tripNameDraft}
            onChange={(event) => setTripNameDraft(event.target.value)}
            autoFocus
            className="w-full text-3xl font-bold tracking-tight sm:text-[5rem]"
          />
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              className="bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 focus-visible:border-primary"
              aria-label="Save trip name"
              disabled={!tripNameDraft.trim()}
            >
              <HugeiconsIcon icon={Tick02Icon} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 focus-visible:border-destructive/40"
              aria-label="Cancel editing trip name"
              onClick={cancelTripNameEdit}
            >
              <HugeiconsIcon icon={Cancel01Icon} />
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex w-full items-center justify-between gap-4">
          <h5
            className="cursor-pointer text-xl font-bold tracking-tight text-gray-900 hover:text-blue-600 sm:text-[5rem] dark:text-white dark:hover:text-blue-400"
            onClick={startEditingTripName}
          >
            {trip.name}
          </h5>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/20 focus-visible:border-primary"
            aria-label="Export trip to iCal"
            onClick={exportTrip}
          >
            <HugeiconsIcon icon={CalendarDownload01Icon} />
          </Button>
        </div>
      )}
      <Separator className="my-6" />
      <TripStats tripId={tripId} tripData={tripData} />
      <Separator className="my-6" />
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
                  <li key={stop.id} className="relative pl-8">
                    <div className="flex w-full items-center gap-4">
                      {/* Icon */}
                      <div className="border-primary bg-background absolute top-3 left-px mb-3 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border-2">
                        <MapPin className="h-5 w-5" />
                      </div>

                      {/* Stop content */}
                      <Stop stop={stop} />
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
