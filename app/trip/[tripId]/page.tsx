"use client";
import { useState, useEffect } from "react";
import { useDatabase } from "@/lib/DatabaseProvider";
import { useParams } from "next/navigation";
import { Stop } from "./components/Stop";
import {
  TripDocumentType,
  StopDocumentType,
  AccommodationDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { TripStats } from "./components/TripStats";
import { StopItems } from "./components/StopItems";
import { Timeline } from "./components/Timeline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dot, MapPin } from "lucide-react";

function TripDetails() {
  const params = useParams();
  const tripId = params.tripId as string;
  const database = useDatabase();

  const [trip, setTrip] = useState<TripDocumentType | null>(null);
  const [stops, setStops] = useState<StopDocumentType[]>([]);
  const [accommodationsByStop, setAccommodationsByStop] = useState<
    Record<string, AccommodationDocumentType[]>
  >({});
  const [transportsByStop, setTransportsByStop] = useState<
    Record<string, TransportDocumentType[]>
  >({});
  const [isEditingTripName, setIsEditingTripName] = useState(false);
  const [loading, setLoading] = useState(true);

  // Subscribe to trip changes
  useEffect(() => {
    const subscription = database.trips
      .findOne(tripId)
      .$.subscribe((tripRecord) => {
        setTrip(tripRecord);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [tripId, database]);

  // Subscribe to stops changes
  useEffect(() => {
    const subscription = database.stops
      .find({ selector: { tripId } })
      .sort({ date: "asc", createdAt: "asc" })
      .$.subscribe((stopsRecords) => {
        setStops(stopsRecords);
      });

    return () => subscription.unsubscribe();
  }, [tripId, database]);

  // Subscribe to accommodations changes
  useEffect(() => {
    const subscription = database.accommodations
      .find()
      .sort({ checkIn: "asc", createdAt: "asc" })
      .$.subscribe((allAccommodations) => {
        const accomMap: Record<string, AccommodationDocumentType[]> = {};
        allAccommodations.forEach((accom) => {
          if (!accomMap[accom.stopId]) {
            accomMap[accom.stopId] = [];
          }
          accomMap[accom.stopId].push(accom);
        });
        setAccommodationsByStop(accomMap);
      });

    return () => subscription.unsubscribe();
  }, [database]);

  // Subscribe to transports changes
  useEffect(() => {
    const subscription = database.transports
      .find()
      .sort({ date: "asc", createdAt: "asc" })
      .$.subscribe((allTransports) => {
        const transMap: Record<string, TransportDocumentType[]> = {};
        allTransports.forEach((transport) => {
          if (!transMap[transport.stopId]) {
            transMap[transport.stopId] = [];
          }
          transMap[transport.stopId].push(transport);
        });
        setTransportsByStop(transMap);
      });

    return () => subscription.unsubscribe();
  }, [database]);

  const updateTripName = async (newName: string) => {
    if (!trip) return;
    await trip.patch({ name: newName });
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
    <main className="flex min-h-screen max-w-4xl flex-col items-center sm:items-start">
      {isEditingTripName ? (
        <Input
          type="text"
          value={trip.name}
          onChange={(e) => updateTripName(e.target.value)}
          onBlur={() => setIsEditingTripName(false)}
          autoFocus
          className="w-full text-3xl font-bold tracking-tight sm:text-[5rem]"
        />
      ) : (
        <h1
          className="cursor-pointer text-3xl font-bold tracking-tight text-gray-900 hover:text-blue-600 sm:text-[5rem] dark:text-white dark:hover:text-blue-400"
          onClick={() => setIsEditingTripName(true)}
        >
          {trip.name}
        </h1>
      )}
      <Separator className="my-6" />
      <TripStats
        trip={trip}
        stops={stops}
        accommodationsByStop={accommodationsByStop}
        transportsByStop={transportsByStop}
      />
      <Separator className="my-6" />
      <section id="stops-section" className="w-full text-left">
        {stops.length > 0 && (
          <Timeline
            className="ml-3"
            lineClassName="absolute top-4 bottom-1 left-0 border-l-2"
            endMarker={
              <div className="bg-background border-primary absolute -bottom-2 left-0 flex size-4 -translate-x-1/2 items-center justify-center rounded-full border-2">
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
          Add Stop
        </Button>
      </section>
    </main>
  );
}

export default TripDetails;
