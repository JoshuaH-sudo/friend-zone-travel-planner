"use client";

import type {
  AccommodationDocumentType,
  ExpenseDocumentType,
  StopDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";

type ItineraryTabProps = {
  stops: StopDocumentType[];
  accommodationsByStop: Record<string, AccommodationDocumentType[]>;
  transportsByStop: Record<string, TransportDocumentType[]>;
  expenses: ExpenseDocumentType[];
};

export function ItineraryTab({
  stops,
  accommodationsByStop,
  transportsByStop,
  expenses,
}: ItineraryTabProps) {
  const grouped = new Map<
    string,
    {
      stops: StopDocumentType[];
      accommodations: AccommodationDocumentType[];
      transports: TransportDocumentType[];
      expenses: ExpenseDocumentType[];
    }
  >();

  const register = (date: string) => {
    const key = date.slice(0, 10);
    if (!grouped.has(key)) {
      grouped.set(key, {
        stops: [],
        accommodations: [],
        transports: [],
        expenses: [],
      });
    }
    return grouped.get(key)!;
  };

  for (const stop of stops) {
    register(stop.date).stops.push(stop);
    for (const accommodation of accommodationsByStop[stop.id] || []) {
      register(accommodation.checkIn).accommodations.push(accommodation);
    }
    for (const transport of transportsByStop[stop.id] || []) {
      register(transport.departureDateTime).transports.push(transport);
    }
  }

  for (const expense of expenses) {
    register(expense.date).expenses.push(expense);
  }

  const days = [...grouped.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-4">
      {days.map(([date, day]) => (
        <section
          key={date}
          className={`rounded-2xl border p-4 ${date === today ? "bg-primary/10 border-primary/30" : "bg-card border-border"}`}
        >
          <h3 className="font-serif text-2xl">
            {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h3>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            {day.stops.map((item) => (
              <p key={item.id}>📍 {item.name}</p>
            ))}
            {day.accommodations.map((item) => (
              <p key={item.id}>🏨 {item.name}</p>
            ))}
            {day.transports.map((item) => (
              <p key={item.id}>🚆 {item.name}</p>
            ))}
            {day.expenses.map((item) => (
              <p key={item.id}>💳 {item.description}</p>
            ))}
          </div>
        </section>
      ))}
      {days.length === 0 ? (
        <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center">
          Add stops to build your itinerary.
        </p>
      ) : null}
    </div>
  );
}
