"use client";
import { useState } from "react";

const Stop = ({
  name,
  date,
  onNameChange,
  onDateChange,
}: {
  name: string;
  date: string;
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
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between gap-2">
        {isEditingName ? (
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={toggleEditName}
            autoFocus
            className="text-xl font-semibold border rounded px-2 py-1 flex-1"
          />
        ) : (
          <h3
            className="text-xl font-semibold cursor-pointer hover:text-blue-600 flex-1"
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
        <p
          className="text-gray-600 cursor-pointer hover:text-blue-600 mt-2"
          onClick={toggleEditDate}
        >
          {new Date(date).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

const DUMMY_TRIP = {
  id: "1",
  name: "Japan Trip",
  stops: [
    {
      id: "1",
      name: "Tokyo",
      date: "2024-01-01",
    },
    {
      id: "2",
      name: "Kyoto",
      date: "2024-01-05",
    },
    {
      id: "3",
      name: "Osaka",
      date: "2024-01-10",
    },
  ],
};
export default function Home() {
  const [trip, setTrip] = useState(DUMMY_TRIP);

  const addStop = () => {
    const newStop = {
      id: (trip.stops.length + 1).toString(),
      name: `New Stop ${trip.stops.length + 1}`,
      date: new Date().toISOString().split("T")[0],
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-[5rem]">
          {trip.name}
        </h1>
        <div className="mt-10 w-full rounded-xl border p-6 text-left">
          <h2 className="text-2xl font-bold mb-4">Stops</h2>
          <ul className="space-y-4">
            {trip.stops.map((stop) => (
              <li key={stop.id} className="py-1">
                <Stop
                  key={stop.id}
                  name={stop.name}
                  date={stop.date}
                  onNameChange={(newName) => updateStopName(stop.id, newName)}
                  onDateChange={(newDate) => updateStopDate(stop.id, newDate)}
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
        </div>
      </main>
    </div>
  );
}
