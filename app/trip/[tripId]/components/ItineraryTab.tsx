"use client";

import type {
  AccommodationDocumentType,
  ExpenseDocumentType,
  StopDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { parseISO, format as formatDate } from "date-fns";

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
  // Build a flat list of all items with their stop context and their own date
  type ItineraryItem =
    | { type: "accommodation"; item: AccommodationDocumentType; stop: StopDocumentType | undefined; date: string }
    | { type: "transport"; item: TransportDocumentType; stop: StopDocumentType | undefined; date: string }
    | { type: "expense"; item: ExpenseDocumentType; stop: StopDocumentType | undefined; date: string };

  const items: ItineraryItem[] = [];
  for (const stop of stops) {
    for (const accommodation of accommodationsByStop[stop.id] || []) {
      items.push({ type: "accommodation", item: accommodation, stop, date: accommodation.checkIn });
    }
    for (const transport of transportsByStop[stop.id] || []) {
      items.push({ type: "transport", item: transport, stop, date: transport.departureDateTime });
    }
  }
  for (const expense of expenses) {
    // Try to associate expense with a stop if possible
    const stop = expense.stopId ? stops.find(s => s.id === expense.stopId) : undefined;
    items.push({ type: "expense", item: expense, stop, date: expense.date || "9999-12-31" }); // Put undated expenses at the end
  }

  // Sort items by their own date (preserve order for same date)
  items.sort((a, b) => a.date.localeCompare(b.date));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center">
          Add stops to build your itinerary.
        </p>
      ) : (
        <section className="rounded-2xl border p-4 bg-card border-border">
          <div className="flex flex-col gap-2 text-sm">
            {items.map((entry) => {
              let icon = "";
              let label = "";
              if (entry.type === "accommodation") {
                icon = "🏨";
                label = entry.item.name;
              } else if (entry.type === "transport") {
                icon = "🚆";
                label = entry.item.name;
              } else if (entry.type === "expense") {
                icon = "💳";
                label = entry.item.description;
              }
              const dateStr = formatDate(parseISO(entry.date), "MMM d, yyyy");
              const stopStr = entry.stop ? `📍 ${entry.stop.name}` : "";
              return (
                <div key={entry.item.id} className={`flex items-center gap-2 ${entry.date.slice(0,10) === today ? "bg-primary/10 border-primary/30 rounded px-2" : ""}`}>
                  <span className="text-muted-foreground text-xs min-w-[110px]">{dateStr}</span>
                  {stopStr && <span className="text-xs text-primary font-serif font-semibold">{stopStr}</span>}
                  <span>{icon} {label}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
