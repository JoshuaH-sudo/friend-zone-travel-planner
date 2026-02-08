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
  onAddAccommodation,
}: {
  isSelected: boolean;
  stop: {
    id: string;
    name: string;
    date: string;
  };
  onNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onAddAccommodation: (stopId: string) => void;
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
      className={`border rounded-lg p-4 ${isSelected ? "border-blue-500" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        {isEditingName ? (
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={toggleEditName}
            autoFocus
            className="text-xl font-semibold border rounded px-2 py-1"
          />
        ) : (
          <h3
            className="text-xl font-semibold cursor-pointer hover:text-blue-600"
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
          className="text-gray-600 border rounded px-2 py-1 mt-2"
        />
      ) : (
        <div className="w-fit">
          <p
            className="text-gray-600 cursor-pointer hover:text-blue-600 mt-2"
            onClick={toggleEditDate}
          >
            {new Date(date).toLocaleDateString()}
          </p>
        </div>
      )}
      <div className="w-full">
        <button
          className="mt-2 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          onClick={() => onAddAccommodation(id)}
        >
          Add Accommodation
        </button>
      </div>
    </div>
  );
};

const Accommodation = ({
  accommodation,
}: {
  accommodation: {
    name: string;
    price: number;
    currency: string;
    checkIn: string;
    checkOut: string;
  };
}) => {
  const { name, price, currency, checkIn, checkOut } = accommodation;
  return (
    <div className="border rounded-lg p-4">
      <h4 className="text-lg font-semibold">{name}</h4>
      <p className="text-gray-600">
        {price} {currency}
      </p>
      <p className="text-gray-600">
        Check-in: {new Date(checkIn).toLocaleDateString()}
      </p>
      <p className="text-gray-600">
        Check-out: {new Date(checkOut).toLocaleDateString()}
      </p>
    </div>
  );
};

export default function Home() {
  const [trip, setTrip] = useState(DUMMY_TRIP);
  const [showAddAccommodation, setShowAddAccommodation] = useState<
    string | null
  >(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const onSelectStop = (stopId: string | null) => {
    setSelectedStopId(stopId);
  };

  const onAddAccommodation = (stopId: string) => {
    setShowAddAccommodation(stopId);
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
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-[5rem]">
          {trip.name}
        </h1>
        <div className="flex flex-row items-start gap-10 w-full">
          <section
            id="stops-section"
            className="mt-10 w-full rounded-xl border p-6 text-left"
          >
            <h2 className="text-2xl font-bold mb-4">Stops</h2>
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
                    onAddAccommodation={(stopId) => onAddAccommodation(stopId)}
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
              <h2 className="text-2xl font-bold mb-4">Accommodations</h2>
              <ul className="space-y-4">
                {accommodations?.map((accommodation) => (
                  <li key={accommodation.id} className="py-1">
                    <Accommodation accommodation={accommodation} />
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
