"use client";
import { useState, useEffect, useCallback } from "react";
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

  const loadTripData = useCallback(async () => {
    try {
      const tripRecord = await database.trips.findOne(tripId).exec();
      tripRecord?.populate("stops");
      tripRecord?.populate("accommodations");
      tripRecord?.populate("transports");
      setTrip(tripRecord);

      const stopsRecords = await database.stops
        .find({ selector: { tripId } })
        .sort({ date: "asc", createdAt: "asc" })
        .exec();

      setStops(stopsRecords);

      // Load accommodations and transports for each stop
      const accomMap: Record<string, AccommodationDocumentType[]> = {};
      const transMap: Record<string, TransportDocumentType[]> = {};

      for (const stop of stopsRecords) {
        const accoms = await database.accommodations
          .find({ selector: { stopId: stop.id } })
          .sort({ checkIn: "asc", createdAt: "asc" })
          .exec();
        accomMap[stop.id] = accoms;

        const trans = await database.transports
          .find({ selector: { stopId: stop.id } })
          .sort({ date: "asc", createdAt: "asc" })
          .exec();
        transMap[stop.id] = trans;
      }

      setAccommodationsByStop(accomMap);
      setTransportsByStop(transMap);
      setLoading(false);
    } catch (error) {
      console.error("Error loading trip:", error);
      setLoading(false);
    }
  }, [tripId, database]);

  useEffect(() => {
    loadTripData();
  }, [loadTripData]);

  const updateTripName = async (newName: string) => {
    if (!trip) return;
    await trip.patch({ name: newName });
    await loadTripData();
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
    await loadTripData();
  };

  const updateStop = async (
    stopId: string,
    data: { name: string; date: string },
  ) => {
    const stopRecord = stops.find((s) => s.id === stopId);
    if (!stopRecord) return;

    await stopRecord.patch({
      name: data.name,
      date: data.date,
      updatedAt: Date.now(),
    });
    await loadTripData();
  };

  const deleteStop = async (stopId: string) => {
    const stopRecord = stops.find((s) => s.id === stopId);
    if (!stopRecord) return;

    // Delete related accommodations and transports first
    const accoms = accommodationsByStop[stopId] || [];
    const trans = transportsByStop[stopId] || [];

    for (const accom of accoms) {
      await accom.remove();
    }
    for (const transport of trans) {
      await transport.remove();
    }

    await stopRecord.remove();
    await loadTripData();
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
    await loadTripData();
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
    await loadTripData();
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
    <main className="flex min-h-screen w-full max-w-4xl flex-col items-center sm:items-start">
      {isEditingTripName ? (
        <input
          type="text"
          value={trip.name}
          onChange={(e) => updateTripName(e.target.value)}
          onBlur={() => setIsEditingTripName(false)}
          autoFocus
          className="w-full rounded border px-2 py-1 text-3xl font-bold tracking-tight text-gray-900 sm:text-[5rem] dark:bg-black dark:text-white"
        />
      ) : (
        <h1
          className="cursor-pointer text-3xl font-bold tracking-tight text-gray-900 hover:text-blue-600 sm:text-[5rem] dark:text-white dark:hover:text-blue-400"
          onClick={() => setIsEditingTripName(true)}
        >
          {trip.name}
        </h1>
      )}
      <hr className="my-6 w-full border-gray-300" />
      <TripStats
        trip={trip}
        stops={stops}
        accommodationsByStop={accommodationsByStop}
        transportsByStop={transportsByStop}
      />
      <hr className="my-6 w-full border-gray-300" />
      <section id="stops-section" className="w-full text-left">
        <ul className="space-y-8">
          {stops.map((stop) => {
            const accommodations = accommodationsByStop[stop.id] || [];
            const transports = transportsByStop[stop.id] || [];

            return (
              <li key={stop.id}>
                <Stop
                  stop={stop}
                  onUpdate={(data) => updateStop(stop.id, data)}
                  onDelete={() => deleteStop(stop.id)}
                />
                <StopItems
                  transports={transports}
                  accommodations={accommodations}
                  stop={stop}
                  onAddAccommodation={onAddAccommodation}
                  onAddTransport={onAddTransport}
                  onItemsChange={loadTripData}
                />
              </li>
            );
          })}
        </ul>
        <button
          className="mt-6 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={addStop}
        >
          Add Stop
        </button>
      </section>
    </main>
  );
}

export default TripDetails;
