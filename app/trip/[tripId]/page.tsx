"use client";
import { useState, useEffect } from "react";
import { useDatabase } from "@/lib/DatabaseProvider";
import { useParams } from "next/navigation";
import { Transport } from "./components/Transport";
import { Accommodation } from "./components/Accommodation";
import { Stop } from "./components/Stop";

function TripDetails() {
  const params = useParams();
  const tripId = params.tripId as string;
  const database = useDatabase();

  const [trip, setTrip] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [accommodationsByStop, setAccommodationsByStop] = useState<
    Record<string, any[]>
  >({});
  const [transportsByStop, setTransportsByStop] = useState<
    Record<string, any[]>
  >({});
  const [isEditingTripName, setIsEditingTripName] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTripData();
  }, [tripId, database]);

  const loadTripData = async () => {
    try {
      const tripRecord = await database.get("trips").find(tripId);
      setTrip(tripRecord);

      const stopsRecords = await database
        .get("stops")
        .query()
        .fetch()
        .then((allStops: any[]) =>
          allStops.filter((s: any) => s.tripId === tripId),
        );
      setStops(stopsRecords);

      // Load accommodations and transports for each stop
      const accomMap: Record<string, any[]> = {};
      const transMap: Record<string, any[]> = {};

      for (const stop of stopsRecords) {
        const accoms = await database
          .get("accommodations")
          .query()
          .fetch()
          .then((all: any[]) => all.filter((a: any) => a.stopId === stop.id));
        accomMap[stop.id] = accoms;

        const trans = await database
          .get("transports")
          .query()
          .fetch()
          .then((all: any[]) => all.filter((t: any) => t.stopId === stop.id));
        transMap[stop.id] = trans;
      }

      setAccommodationsByStop(accomMap);
      setTransportsByStop(transMap);
      setLoading(false);
    } catch (error) {
      console.error("Error loading trip:", error);
      setLoading(false);
    }
  };

  const updateTripName = async (newName: string) => {
    if (!trip) return;
    await database.write(async () => {
      await trip.update((t: any) => {
        t.name = newName;
      });
    });
    setTrip({ ...trip, name: newName });
  };

  const addStop = async () => {
    await database.write(async () => {
      const stopsCollection = database.get("stops");
      await stopsCollection.create((stop: any) => {
        stop.name = `New Stop ${stops.length + 1}`;
        stop.date = new Date().toISOString().split("T")[0];
        stop.tripId = tripId;
      });
    });
    await loadTripData();
  };

  const updateStop = async (
    stopId: string,
    data: { name: string; date: string },
  ) => {
    const stopRecord = stops.find((s) => s.id === stopId);
    if (!stopRecord) return;

    await database.write(async () => {
      await stopRecord.update((s: any) => {
        s.name = data.name;
        s.date = data.date;
      });
    });
    await loadTripData();
  };

  const deleteStop = async (stopId: string) => {
    const stopRecord = stops.find((s) => s.id === stopId);
    if (!stopRecord) return;

    await database.write(async () => {
      // Delete related accommodations and transports first
      const accoms = accommodationsByStop[stopId] || [];
      const trans = transportsByStop[stopId] || [];

      for (const accom of accoms) {
        await accom.markAsDeleted();
      }
      for (const transport of trans) {
        await transport.markAsDeleted();
      }

      await stopRecord.markAsDeleted();
    });
    await loadTripData();
  };

  const onAddAccommodation = async (stopId: string) => {
    const stop = stops.find((s) => s.id === stopId);
    if (!stop) return;

    await database.write(async () => {
      const accommodationsCollection = database.get("accommodations");
      await accommodationsCollection.create((acc: any) => {
        acc.name = "New Accommodation";
        acc.price = 0;
        acc.currency = "USD";
        acc.checkIn = stop.date || new Date().toISOString().split("T")[0];
        acc.checkOut = stop.date || new Date().toISOString().split("T")[0];
        acc.stopId = stopId;
      });
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

    await database.write(async () => {
      await accomRecord.update((a: any) => {
        a.name = data.name;
        a.price = data.price;
        a.currency = data.currency;
        a.checkIn = data.checkIn;
        a.checkOut = data.checkOut;
      });
    });
    await loadTripData();
  };

  const onDeleteAccommodation = async (
    stopId: string,
    accommodationId: string,
  ) => {
    console.log("onDeleteAccommodation called", { stopId, accommodationId });
    const accoms = accommodationsByStop[stopId] || [];
    const accomRecord = accoms.find((a) => a.id === accommodationId);
    if (!accomRecord) {
      console.error("Accommodation record not found");
      return;
    }

    await database.write(async () => {
      await accomRecord.markAsDeleted();
    });
    await loadTripData();
  };

  const onAddTransport = async (stopId: string) => {
    const stop = stops.find((s) => s.id === stopId);
    if (!stop) return;

    await database.write(async () => {
      const transportsCollection = database.get("transports");
      await transportsCollection.create((trans: any) => {
        trans.name = "New Transport";
        trans.type = "flight";
        trans.price = 0;
        trans.currency = "USD";
        trans.date = stop.date || new Date().toISOString().split("T")[0];
        trans.stopId = stopId;
      });
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

    await database.write(async () => {
      await transRecord.update((t: any) => {
        t.name = data.name;
        t.type = data.type;
        t.price = data.price;
        t.currency = data.currency;
        t.date = data.date;
      });
    });
    await loadTripData();
  };

  const onDeleteTransport = async (stopId: string, transportId: string) => {
    console.log("onDeleteTransport called", { stopId, transportId });
    const trans = transportsByStop[stopId] || [];
    const transRecord = trans.find((t) => t.id === transportId);
    if (!transRecord) {
      console.error("Transport record not found");
      return;
    }

    await database.write(async () => {
      await transRecord.markAsDeleted();
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
