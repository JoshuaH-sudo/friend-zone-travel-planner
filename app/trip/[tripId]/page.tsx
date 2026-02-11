"use client";
import { useState, useEffect, useCallback } from "react";
import { useDatabase } from "@/lib/DatabaseProvider";
import { useParams } from "next/navigation";
import { Transport } from "./components/Transport";
import { Accommodation } from "./components/Accommodation";
import { Stop } from "./components/Stop";
import {
  TripDocumentType,
  StopDocumentType,
  AccommodationDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";

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
      setTrip(tripRecord);

      const stopsRecords = await database.stops
        .find({ selector: { tripId } })
        .exec();
      setStops(stopsRecords);

      // Load accommodations and transports for each stop
      const accomMap: Record<string, AccommodationDocumentType[]> = {};
      const transMap: Record<string, TransportDocumentType[]> = {};

      for (const stop of stopsRecords) {
        const accoms = await database.accommodations
          .find({ selector: { stopId: stop.id } })
          .exec();
        accomMap[stop.id] = accoms;

        const trans = await database.transports
          .find({ selector: { stopId: stop.id } })
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
    await database.stops.insert({
      id: generateId(),
      name: `New Stop ${stops.length + 1}`,
      date: new Date().toISOString().split("T")[0],
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

  const onUpdateAccommodation = async (
    stopId: string,
    accommodationId: string,
    data: {
      name: string;
      price: number;
      currency: string;
      checkIn: string;
      checkOut: string;
    },
  ) => {
    console.log("onUpdateAccommodation called", {
      stopId,
      accommodationId,
      data,
    });
    const accoms = accommodationsByStop[stopId] || [];
    const accomRecord = accoms.find((a) => a.id === accommodationId);
    if (!accomRecord) {
      console.error("Accommodation record not found");
      return;
    }

    await accomRecord.patch({
      name: data.name,
      price: data.price,
      currency: data.currency,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      updatedAt: Date.now(),
    });
    await loadTripData();
  };

  const onDeleteAccommodation = async (
    stopId: string,
    accommodationId: string,
  ) => {
    const accoms = accommodationsByStop[stopId] || [];
    const accomRecord = accoms.find((a) => a.id === accommodationId);
    if (!accomRecord) {
      return;
    }

    await accomRecord.remove();
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

  const onUpdateTransport = async (
    stopId: string,
    transportId: string,
    data: {
      name: string;
      type: string;
      price: number;
      currency: string;
      date: string;
    },
  ) => {
    console.log("onUpdateTransport called", { stopId, transportId, data });
    const trans = transportsByStop[stopId] || [];
    const transRecord = trans.find((t) => t.id === transportId);
    if (!transRecord) {
      console.error("Transport record not found");
      return;
    }

    await transRecord.patch({
      name: data.name,
      type: data.type,
      price: data.price,
      currency: data.currency,
      date: data.date,
      updatedAt: Date.now(),
    });
    await loadTripData();
  };

  const onDeleteTransport = async (stopId: string, transportId: string) => {
    const trans = transportsByStop[stopId] || [];
    const transRecord = trans.find((t) => t.id === transportId);
    if (!transRecord) {
      return;
    }

    await transRecord.remove();
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center bg-white px-6 py-10 sm:items-start dark:bg-black">
        {isEditingTripName ? (
          <input
            type="text"
            value={trip.name}
            onChange={(e) => updateTripName(e.target.value)}
            onBlur={() => setIsEditingTripName(false)}
            autoFocus
            className="w-full rounded border px-2 py-1 text-5xl font-bold tracking-tight text-gray-900 sm:text-[5rem] dark:bg-black dark:text-white"
          />
        ) : (
          <h1
            className="cursor-pointer text-5xl font-bold tracking-tight text-gray-900 hover:text-blue-600 sm:text-[5rem] dark:text-white dark:hover:text-blue-400"
            onClick={() => setIsEditingTripName(true)}
          >
            {trip.name}
          </h1>
        )}
        <section
          id="stops-section"
          className="mt-10 w-full rounded-xl border p-6 text-left"
        >
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
                  <div className="mt-4 ml-6 space-y-3">
                    {(() => {
                      const items = [
                        ...accommodations.map((acc) => ({
                          model: acc,
                          id: acc.id,
                          type: "accommodation" as const,
                          date: acc.checkIn,
                        })),
                        ...transports.map((trans) => ({
                          model: trans,
                          id: trans.id,
                          type: "transport" as const,
                          date: trans.date,
                        })),
                      ].sort(
                        (a, b) =>
                          new Date(a.date).getTime() -
                          new Date(b.date).getTime(),
                      );

                      return (
                        <>
                          {items.length > 0 && (
                            <ul className="space-y-3">
                              {items.map((item) =>
                                item.type === "accommodation" ? (
                                  <li key={item.id}>
                                    <Accommodation
                                      accommodation={item.model}
                                      onUpdate={(data) =>
                                        onUpdateAccommodation(
                                          stop.id,
                                          item.id,
                                          data,
                                        )
                                      }
                                      onDelete={() =>
                                        onDeleteAccommodation(stop.id, item.id)
                                      }
                                    />
                                  </li>
                                ) : (
                                  <li key={item.id}>
                                    <Transport
                                      transport={item.model}
                                      onUpdate={(data) =>
                                        onUpdateTransport(
                                          stop.id,
                                          item.id,
                                          data,
                                        )
                                      }
                                      onDelete={() =>
                                        onDeleteTransport(stop.id, item.id)
                                      }
                                    />
                                  </li>
                                ),
                              )}
                            </ul>
                          )}
                          <div className="mt-3 flex gap-2">
                            <button
                              className="rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
                              onClick={() => onAddAccommodation(stop.id)}
                            >
                              Add Accommodation
                            </button>
                            <button
                              className="rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
                              onClick={() => onAddTransport(stop.id)}
                            >
                              Add Transport
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
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
    </div>
  );
}

export default TripDetails;
