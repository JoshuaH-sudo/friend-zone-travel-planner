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
    },
  ],
};

const Stop = ({
  isSelected,
  stop: { id, name, date },
  onNameChange,
  onDateChange,
  onShowAddAccommodation,
}: {
  isSelected: boolean;
  stop: {
    id: string;
    name: string;
    date: string;
  };
  onNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onShowAddAccommodation: (stopId: string) => void;
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
    <div
      className={`rounded-lg border p-4 ${isSelected ? "border-blue-500" : ""}`}
    >
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
      <div className="w-full">
        <button
          className="mt-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          onClick={() => onShowAddAccommodation(id)}
        >
          Add Accommodation
        </button>
      </div>
    </div>
  );
};

const Accommodation = ({
  accommodation,
  onUpdate,
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
}) => {
  const { name, price, currency, checkIn, checkOut } = accommodation;
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);
  const [isEditingCheckIn, setIsEditingCheckIn] = useState(false);
  const [isEditingCheckOut, setIsEditingCheckOut] = useState(false);

  return (
    <div className="rounded-lg border p-4">
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

export default function Home() {
  const [trip, setTrip] = useState(DUMMY_TRIP);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const onSelectStop = (stopId: string | null) => {
    setSelectedStopId(stopId);
  };

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

  const addStop = () => {
    const newStop = {
      id: (trip.stops.length + 1).toString(),
      name: `New Stop ${trip.stops.length + 1}`,
      date: new Date().toISOString().split("T")[0],
      accommodations: [],
    };
    setTrip({
      ...trip,
      stops: [...trip.stops, newStop],
    });
  };

  const updateStopName = (stopId: string, newName: string) => {
    setTrip({
      ...trip,
      stops: trip.stops.map((stop) =>
        stop.id === stopId ? { ...stop, name: newName } : stop,
      ),
    });
  };

  const updateStopDate = (stopId: string, newDate: string) => {
    setTrip({
      ...trip,
      stops: trip.stops.map((stop) =>
        stop.id === stopId ? { ...stop, date: newDate } : stop,
      ),
    });
  };

  const accommodations = trip.stops.find(
    (stop) => stop.id === selectedStopId,
  )?.accommodations;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-between bg-white px-16 py-32 sm:items-start dark:bg-black">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-[5rem] dark:text-white">
          {trip.name}
        </h1>
        <div className="flex w-full flex-row items-start gap-10">
          <section
            id="stops-section"
            className="mt-10 w-full rounded-xl border p-6 text-left"
          >
            <h2 className="mb-4 text-2xl font-bold">Stops</h2>
            <ul className="space-y-4">
              {trip.stops.map((stop) => (
                <li
                  key={stop.id}
                  className="py-1"
                  onClick={() => onSelectStop(stop.id)}
                >
                  <Stop
                    key={stop.id}
                    isSelected={selectedStopId === stop.id}
                    stop={stop}
                    onNameChange={(newName) => updateStopName(stop.id, newName)}
                    onDateChange={(newDate) => updateStopDate(stop.id, newDate)}
                    onShowAddAccommodation={(stopId) =>
                      onAddAccommodation(stopId)
                    }
                  />
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
          {accommodations && accommodations.length > 0 && (
            <section
              id="accommodations-section"
              className="mt-10 w-full rounded-xl border p-6 text-left"
            >
              <h2 className="mb-4 text-2xl font-bold">Accommodations</h2>
              <ul className="space-y-4">
                {accommodations?.map((accommodation) => (
                  <li key={accommodation.id} className="py-1">
                    <Accommodation
                      accommodation={accommodation}
                      onUpdate={(field, value) =>
                        onUpdateAccommodation(
                          selectedStopId!,
                          accommodation.id,
                          field,
                          value,
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
