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
  stop: { id, name, date },
  onNameChange,
  onDateChange,
}: {
  stop: {
    id: string;
    name: string;
    date: string;
  };
  onNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
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
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        {isEditingName ? (
          <input
            type="text"
            value={name}
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
            {name}
          </h3>
        )}
      </div>
      {isEditingDate ? (
        <input
          type="date"
          value={date}
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
            {new Date(date).toLocaleDateString()}
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
  accommodation: {
    id: string;
    name: string;
    price: number;
    currency: string;
    checkIn: string;
    checkOut: string;
  };
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
  transport: {
    id: string;
    name: string;
    type: string;
    price: number;
    currency: string;
  };
  onUpdate: (field: string, value: string | number) => void;
  onDelete: () => void;
}) => {
  const { name, type, price, currency } = transport;
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingType, setIsEditingType] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);

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
    </div>
  );
};

function TripDetails() {
  const [trip, setTrip] = useState(DUMMY_TRIP);

  const onAddAccommodation = (stopId: string) => {
    const stop = trip.stops.find((s) => s.id === stopId);
    const id = (Math.random() * 100000).toFixed(0);
    const newAccommodation = {
      id,
      name: "New Accommodation",
      price: 0,
      currency: "USD",
      checkIn: stop?.date || new Date().toISOString().split("T")[0],
      checkOut: stop?.date || new Date().toISOString().split("T")[0],
    };
    setTrip({
      ...trip,
      stops: trip.stops.map((stop) =>
        stop.id === stopId
          ? {
              ...stop,
              accommodations: [...stop.accommodations, newAccommodation],
            }
          : stop,
      ),
    });
  };

  const onUpdateAccommodation = (
    stopId: string,
    accommodationId: string,
    field: string,
    value: string | number,
  ) => {
    setTrip({
      ...trip,
      stops: trip.stops.map((stop) =>
        stop.id === stopId
          ? {
              ...stop,
              accommodations: stop.accommodations.map((acc) =>
                acc.id === accommodationId ? { ...acc, [field]: value } : acc,
              ),
            }
          : stop,
      ),
    });
  };

  const onDeleteAccommodation = (stopId: string, accommodationId: string) => {
    setTrip({
      ...trip,
      stops: trip.stops.map((stop) =>
        stop.id === stopId
          ? {
              ...stop,
              accommodations: stop.accommodations.filter(
                (acc) => acc.id !== accommodationId,
              ),
            }
          : stop,
      ),
    });
  };

  const onAddTransport = (stopId: string) => {
    const id = (Math.random() * 100000).toFixed(0);
    const newTransport = {
      id,
      name: "New Transport",
      type: "flight",
      price: 0,
      currency: "USD",
    };
    setTrip({
      ...trip,
      stops: trip.stops.map((stop) =>
        stop.id === stopId
          ? {
              ...stop,
              transport: [...stop.transport, newTransport],
            }
          : stop,
      ),
    });
  };

  const onUpdateTransport = (
    stopId: string,
    transportId: string,
    field: string,
    value: string | number,
  ) => {
    setTrip({
      ...trip,
      stops: trip.stops.map((stop) =>
        stop.id === stopId
          ? {
              ...stop,
              transport: stop.transport.map((trans) =>
                trans.id === transportId ? { ...trans, [field]: value } : trans,
              ),
            }
          : stop,
      ),
    });
  };

  const onDeleteTransport = (stopId: string, transportId: string) => {
    setTrip({
      ...trip,
      stops: trip.stops.map((stop) =>
        stop.id === stopId
          ? {
              ...stop,
              transport: stop.transport.filter(
                (trans) => trans.id !== transportId,
              ),
            }
          : stop,
      ),
    });
  };

  const addStop = () => {
    const newStop = {
      id: (trip.stops.length + 1).toString(),
      name: `New Stop ${trip.stops.length + 1}`,
      date: new Date().toISOString().split("T")[0],
      accommodations: [],
      transport: [],
    };
    setTrip({
      ...trip,
      stops: [...trip.stops, newStop],
    });
  };

  const updateStop = (
    stopId: string,
    field: string,
    value: string | number,
  ) => {
    setTrip({
      ...trip,
      stops: trip.stops.map((stop) =>
        stop.id === stopId ? { ...stop, [field]: value } : stop,
      ),
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-between bg-white px-6 py-20 sm:items-start dark:bg-black">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-[5rem] dark:text-white">
          {trip.name}
        </h1>
        <section
          id="stops-section"
          className="mt-10 w-full rounded-xl border p-6 text-left"
        >
          <ul className="space-y-8">
            {trip.stops.map((stop) => (
              <li key={stop.id}>
                <Stop
                  stop={stop}
                  onNameChange={(newName) =>
                    updateStop(stop.id, "name", newName)
                  }
                  onDateChange={(newDate) =>
                    updateStop(stop.id, "date", newDate)
                  }
                />
                <div className="mt-4 ml-6 space-y-6">
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-700">
                      Accommodations
                    </h3>
                    {stop.accommodations.length > 0 && (
                      <ul className="space-y-3">
                        {stop.accommodations.map((accommodation) => (
                          <li key={accommodation.id}>
                            <Accommodation
                              accommodation={accommodation}
                              onUpdate={(field, value) =>
                                onUpdateAccommodation(
                                  stop.id,
                                  accommodation.id,
                                  field,
                                  value,
                                )
                              }
                              onDelete={() =>
                                onDeleteAccommodation(stop.id, accommodation.id)
                              }
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      className="mt-3 rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
                      onClick={() => onAddAccommodation(stop.id)}
                    >
                      Add Accommodation
                    </button>
                  </div>
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-700">
                      Transport
                    </h3>
                    {stop.transport.length > 0 && (
                      <ul className="space-y-3">
                        {stop.transport.map((trans) => (
                          <li key={trans.id}>
                            <Transport
                              transport={trans}
                              onUpdate={(field, value) =>
                                onUpdateTransport(
                                  stop.id,
                                  trans.id,
                                  field,
                                  value,
                                )
                              }
                              onDelete={() =>
                                onDeleteTransport(stop.id, trans.id)
                              }
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      className="mt-3 rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
                      onClick={() => onAddTransport(stop.id)}
                    >
                      Add Transport
                    </button>
                  </div>
                </div>
              </li>
            ))}
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
