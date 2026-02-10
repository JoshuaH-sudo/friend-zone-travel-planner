"use client";
import { useState, useEffect } from "react";
import { useDatabase } from "@/lib/DatabaseProvider";
import { useParams } from "next/navigation";

const DUMMY_TRIP = {
  id: "1",
  name: "Japan Trip",
  stops: [
    {
      id: "1",
      name: "Tokyo",
      date: "2024-01-01",
      accommodations: [
        {
          id: "1",
          name: "Hotel Tokyo",
          price: 100,
          currency: "USD",
          checkIn: "2024-01-01",
          checkOut: "2024-01-05",
        },
        {
          id: "4",
          name: "Tokyo Hostel",
          price: 50,
          currency: "USD",
          checkIn: "2024-01-01",
          checkOut: "2024-01-05",
        },
      ],
      transport: [
        {
          id: "1",
          name: "Flight to Tokyo",
          type: "flight",
          price: 500,
          currency: "USD",
          date: "2024-01-01",
        },
      ],
    },
    {
      id: "2",
      name: "Kyoto",
      date: "2024-01-05",
      accommodations: [
        {
          id: "2",
          name: "Kyoto Inn",
          price: 80,
          currency: "USD",
          checkIn: "2024-01-05",
          checkOut: "2024-01-10",
        },
      ],
      transport: [
        {
          id: "2",
          name: "Train to Kyoto",
          type: "bus",
          price: 150,
          currency: "USD",
          date: "2024-01-05",
        },
      ],
    },
    {
      id: "3",
      name: "Osaka",
      date: "2024-01-10",
      accommodations: [
        {
          id: "3",
          name: "Osaka Hotel",
          price: 90,
          currency: "USD",
          checkIn: "2024-01-10",
          checkOut: "2024-01-15",
        },
      ],
      transport: [],
    },
  ],
};

const Stop = ({
  stop,
  onNameChange,
  onDateChange,
  onDelete,
}: {
  stop: any;
  onNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onDelete: () => void;
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);

  const toggleEditName = () => {
    setIsEditingName(!isEditingName);
  };

  const toggleEditDate = () => {
    setIsEditingDate(!isEditingDate);
  };

  return (
    <div className="relative rounded-lg border p-4">
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
        aria-label="Delete stop"
      >
        ✕
      </button>
      <div className="flex items-center justify-between gap-2">
        {isEditingName ? (
          <input
            type="text"
            value={stop.name}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={toggleEditName}
            autoFocus
            className="rounded border px-2 py-1 text-xl font-semibold"
          />
        ) : (
          <h3
            className="cursor-pointer text-xl font-semibold hover:text-blue-600"
            onClick={toggleEditName}
          >
            {stop.name}
          </h3>
        )}
      </div>
      {isEditingDate ? (
        <input
          type="date"
          value={stop.date}
          onChange={(e) => onDateChange(e.target.value)}
          onBlur={toggleEditDate}
          autoFocus
          className="mt-2 rounded border px-2 py-1 text-gray-600"
        />
      ) : (
        <div className="w-fit">
          <p
            className="mt-2 cursor-pointer text-gray-600 hover:text-blue-600"
            onClick={toggleEditDate}
          >
            {new Date(stop.date).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

const Accommodation = ({
  accommodation,
  onUpdate,
  onDelete,
}: {
  accommodation: any;
  onUpdate: (field: string, value: string | number) => void;
  onDelete: () => void;
}) => {
  const { name, price, currency, checkIn, checkOut } = accommodation;
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);
  const [isEditingCheckIn, setIsEditingCheckIn] = useState(false);
  const [isEditingCheckOut, setIsEditingCheckOut] = useState(false);

  return (
    <div className="relative rounded-lg border p-4">
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
        aria-label="Delete accommodation"
      >
        ✕
      </button>
      {isEditingName ? (
        <input
          type="text"
          value={name}
          onChange={(e) => onUpdate("name", e.target.value)}
          onBlur={() => setIsEditingName(false)}
          autoFocus
          className="w-full rounded border px-2 py-1 text-lg font-semibold"
        />
      ) : (
        <h4
          className="cursor-pointer text-lg font-semibold hover:text-blue-600"
          onClick={() => setIsEditingName(true)}
        >
          {name}
        </h4>
      )}
      <div className="mt-2 flex items-center gap-2">
        {isEditingPrice ? (
          <input
            type="number"
            value={price}
            onChange={(e) => onUpdate("price", Number(e.target.value))}
            onBlur={() => setIsEditingPrice(false)}
            autoFocus
            className="w-24 rounded border px-2 py-1 text-gray-600"
          />
        ) : (
          <span
            className="cursor-pointer text-gray-600 hover:text-blue-600"
            onClick={() => setIsEditingPrice(true)}
          >
            {price}
          </span>
        )}
        {isEditingCurrency ? (
          <select
            value={currency}
            onChange={(e) => {
              onUpdate("currency", e.target.value);
              setIsEditingCurrency(false);
            }}
            onBlur={() => setIsEditingCurrency(false)}
            autoFocus
            className="rounded border px-2 py-1 text-gray-600"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="JPY">JPY</option>
          </select>
        ) : (
          <span
            className="cursor-pointer text-gray-600 hover:text-blue-600"
            onClick={() => setIsEditingCurrency(true)}
          >
            {currency}
          </span>
        )}
      </div>
      <div className="mt-2">
        {isEditingCheckIn ? (
          <input
            type="date"
            value={checkIn}
            onChange={(e) => onUpdate("checkIn", e.target.value)}
            onBlur={() => setIsEditingCheckIn(false)}
            autoFocus
            className="rounded border px-2 py-1 text-gray-600"
          />
        ) : (
          <p
            className="cursor-pointer text-gray-600 hover:text-blue-600"
            onClick={() => setIsEditingCheckIn(true)}
          >
            Check-in: {new Date(checkIn).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="mt-1">
        {isEditingCheckOut ? (
          <input
            type="date"
            value={checkOut}
            onChange={(e) => onUpdate("checkOut", e.target.value)}
            onBlur={() => setIsEditingCheckOut(false)}
            autoFocus
            className="rounded border px-2 py-1 text-gray-600"
          />
        ) : (
          <p
            className="cursor-pointer text-gray-600 hover:text-blue-600"
            onClick={() => setIsEditingCheckOut(true)}
          >
            Check-out: {new Date(checkOut).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

const Transport = ({
  transport,
  onUpdate,
  onDelete,
}: {
  transport: any;
  onUpdate: (field: string, value: string | number) => void;
  onDelete: () => void;
}) => {
  const { name, type, price, currency, date } = transport;
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingType, setIsEditingType] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);

  return (
    <div className="relative rounded-lg border p-4">
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
        aria-label="Delete transport"
      >
        ✕
      </button>
      {isEditingName ? (
        <input
          type="text"
          value={name}
          onChange={(e) => onUpdate("name", e.target.value)}
          onBlur={() => setIsEditingName(false)}
          autoFocus
          className="w-full rounded border px-2 py-1 text-lg font-semibold"
        />
      ) : (
        <h4
          className="cursor-pointer text-lg font-semibold hover:text-blue-600"
          onClick={() => setIsEditingName(true)}
        >
          {name}
        </h4>
      )}
      <div className="mt-2 flex items-center gap-2">
        {isEditingType ? (
          <select
            value={type}
            onChange={(e) => {
              onUpdate("type", e.target.value);
              setIsEditingType(false);
            }}
            onBlur={() => setIsEditingType(false)}
            autoFocus
            className="rounded border px-2 py-1 text-gray-600"
          >
            <option value="flight">Flight</option>
            <option value="bus">Bus</option>
            <option value="car">Car</option>
          </select>
        ) : (
          <span
            className="cursor-pointer text-gray-600 hover:text-blue-600"
            onClick={() => setIsEditingType(true)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        )}
        <span className="text-gray-400">•</span>
        {isEditingPrice ? (
          <input
            type="number"
            value={price}
            onChange={(e) => onUpdate("price", Number(e.target.value))}
            onBlur={() => setIsEditingPrice(false)}
            autoFocus
            className="w-24 rounded border px-2 py-1 text-gray-600"
          />
        ) : (
          <span
            className="cursor-pointer text-gray-600 hover:text-blue-600"
            onClick={() => setIsEditingPrice(true)}
          >
            {price}
          </span>
        )}
        {isEditingCurrency ? (
          <select
            value={currency}
            onChange={(e) => {
              onUpdate("currency", e.target.value);
              setIsEditingCurrency(false);
            }}
            onBlur={() => setIsEditingCurrency(false)}
            autoFocus
            className="rounded border px-2 py-1 text-gray-600"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="JPY">JPY</option>
          </select>
        ) : (
          <span
            className="cursor-pointer text-gray-600 hover:text-blue-600"
            onClick={() => setIsEditingCurrency(true)}
          >
            {currency}
          </span>
        )}
      </div>
      <div className="mt-2">
        {isEditingDate ? (
          <input
            type="date"
            value={date}
            onChange={(e) => onUpdate("date", e.target.value)}
            onBlur={() => setIsEditingDate(false)}
            autoFocus
            className="rounded border px-2 py-1 text-gray-600"
          />
        ) : (
          <p
            className="cursor-pointer text-gray-600 hover:text-blue-600"
            onClick={() => setIsEditingDate(true)}
          >
            Date: {new Date(date).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

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

  const updateStop = async (stopId: string, field: string, value: string) => {
    const stopRecord = stops.find((s) => s.id === stopId);
    if (!stopRecord) return;

    await database.write(async () => {
      await stopRecord.update((s: any) => {
        s[field] = value;
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
    field: string,
    value: string | number,
  ) => {
    const accoms = accommodationsByStop[stopId] || [];
    const accomRecord = accoms.find((a) => a.id === accommodationId);
    if (!accomRecord) return;

    await database.write(async () => {
      await accomRecord.update((a: any) => {
        if (field === "checkIn") {
          a.checkIn = value;
        } else if (field === "checkOut") {
          a.checkOut = value;
        } else {
          a[field] = value;
        }
      });
    });
    await loadTripData();
  };

  const onDeleteAccommodation = async (
    stopId: string,
    accommodationId: string,
  ) => {
    const accoms = accommodationsByStop[stopId] || [];
    const accomRecord = accoms.find((a) => a.id === accommodationId);
    if (!accomRecord) return;

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
    field: string,
    value: string | number,
  ) => {
    const trans = transportsByStop[stopId] || [];
    const transRecord = trans.find((t) => t.id === transportId);
    if (!transRecord) return;

    await database.write(async () => {
      await transRecord.update((t: any) => {
        t[field] = value;
      });
    });
    await loadTripData();
  };

  const onDeleteTransport = async (stopId: string, transportId: string) => {
    const trans = transportsByStop[stopId] || [];
    const transRecord = trans.find((t) => t.id === transportId);
    if (!transRecord) return;

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
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-between bg-white px-6 py-10 sm:items-start dark:bg-black">
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
                    onNameChange={(newName) =>
                      updateStop(stop.id, "name", newName)
                    }
                    onDateChange={(newDate) =>
                      updateStop(stop.id, "date", newDate)
                    }
                    onDelete={() => deleteStop(stop.id)}
                  />
                  <div className="mt-4 ml-6 space-y-3">
                    {(() => {
                      const items = [
                        ...accommodations.map((acc) => ({
                          ...acc,
                          type: "accommodation" as const,
                          date: acc.checkIn,
                        })),
                        ...transports.map((trans) => ({
                          ...trans,
                          type: "transport" as const,
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
                                      accommodation={item}
                                      onUpdate={(field, value) =>
                                        onUpdateAccommodation(
                                          stop.id,
                                          item.id,
                                          field,
                                          value,
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
                                      transport={item}
                                      onUpdate={(field, value) =>
                                        onUpdateTransport(
                                          stop.id,
                                          item.id,
                                          field,
                                          value,
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
