"use client";

import type {
  AccommodationDocumentType,
  ExpenseDocumentType,
  StopDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { parseISO, format as formatDate } from "date-fns";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Hotel,
  Plane,
  Train,
  Bus,
  Car,
  Utensils,
  Ticket,
  ShoppingBag,
  MoreHorizontal,
  CreditCard,
} from "lucide-react";

type ItineraryTabProps = {
  stops: StopDocumentType[];
  accommodationsByStop: Record<string, AccommodationDocumentType[]>;
  transportsByStop: Record<string, TransportDocumentType[]>;
  expenses: ExpenseDocumentType[];
};

type DatedItem =
  | { type: "accommodation"; item: AccommodationDocumentType; date: string }
  | { type: "transport"; item: TransportDocumentType; date: string }
  | { type: "expense"; item: ExpenseDocumentType; date: string };

function ExpenseCategoryIcon({ category }: { category: string }) {
  if (category === "food") return <Utensils className="h-3.5 w-3.5" />;
  if (category === "activity") return <Ticket className="h-3.5 w-3.5" />;
  if (category === "shopping") return <ShoppingBag className="h-3.5 w-3.5" />;
  return <MoreHorizontal className="h-3.5 w-3.5" />;
}

export function ItineraryTab({
  stops,
  accommodationsByStop,
  transportsByStop,
  expenses,
}: ItineraryTabProps) {
  const today = new Date().toISOString().slice(0, 10);

  if (stops.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center">
          Add stops to build your itinerary.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border p-4 bg-card border-border">
        <div className="flex flex-col gap-4 text-sm">
          {stops.map((stop) => {
            const accommodations = accommodationsByStop[stop.id] || [];
            const transports = transportsByStop[stop.id] || [];
            const stopExpenses = expenses.filter((e) => e.stopId === stop.id);

            const undatedExpenses = stopExpenses.filter((e) => !e.date);
            const datedExpenses = stopExpenses.filter((e) => Boolean(e.date));

            // Group undated expenses by category, then by currency, summing amounts
            const undatedByCategory = new Map<string, Map<string, number>>();
            for (const expense of undatedExpenses) {
              if (!undatedByCategory.has(expense.category)) {
                undatedByCategory.set(expense.category, new Map());
              }
              const currencyMap = undatedByCategory.get(expense.category)!;
              currencyMap.set(
                expense.currency,
                (currencyMap.get(expense.currency) ?? 0) + expense.price,
              );
            }

            // Build sorted dated items list
            const datedItems: DatedItem[] = [
              ...accommodations.map((item) => ({
                type: "accommodation" as const,
                item,
                date: item.checkIn,
              })),
              ...transports.map((item) => ({
                type: "transport" as const,
                item,
                date: item.departureDateTime,
              })),
              ...datedExpenses.map((item) => ({
                type: "expense" as const,
                item,
                date: item.date!,
              })),
            ];
            datedItems.sort((a, b) => a.date.localeCompare(b.date));

            return (
              <div key={stop.id} className="flex flex-col gap-1.5">
                {/* Stop name header */}
                <div className="text-primary flex items-center gap-1.5 font-semibold">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {stop.name}
                </div>

                {/* Undated expense summary */}
                {undatedByCategory.size > 0 && (
                  <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 pl-5 text-xs">
                    {Array.from(undatedByCategory.entries()).map(
                      ([category, currencyTotals]) => (
                        <span
                          key={category}
                          className="flex items-center gap-1"
                        >
                          <ExpenseCategoryIcon category={category} />
                          <span className="capitalize">{category}</span>:{" "}
                          {Array.from(currencyTotals.entries())
                            .map(([cur, total]) => formatMoney(total, cur))
                            .join(", ")}
                        </span>
                      ),
                    )}
                  </div>
                )}

                {/* Dated items */}
                {datedItems.map((entry) => {
                  const dateStr = formatDate(parseISO(entry.date), "MMM d, yyyy");
                  const isToday = entry.date.slice(0, 10) === today;

                  let icon: React.ReactNode;
                  let label: string;

                  if (entry.type === "accommodation") {
                    icon = <Hotel className="text-muted-foreground h-3.5 w-3.5 shrink-0" />;
                    label = entry.item.name;
                  } else if (entry.type === "transport") {
                    const transportType = entry.item.type;
                    if (transportType === "flight")
                      icon = <Plane className="text-muted-foreground h-3.5 w-3.5 shrink-0" />;
                    else if (transportType === "bus")
                      icon = <Bus className="text-muted-foreground h-3.5 w-3.5 shrink-0" />;
                    else if (transportType === "car")
                      icon = <Car className="text-muted-foreground h-3.5 w-3.5 shrink-0" />;
                    else
                      icon = <Train className="text-muted-foreground h-3.5 w-3.5 shrink-0" />;
                    label = entry.item.name;
                  } else {
                    icon = <CreditCard className="text-muted-foreground h-3.5 w-3.5 shrink-0" />;
                    label = entry.item.name;
                  }

                  return (
                    <div
                      key={entry.item.id}
                      className={cn(
                        "flex items-center gap-2 pl-5",
                        isToday && "bg-primary/10 border-primary/30 rounded pr-2",
                      )}
                    >
                      <span className="text-muted-foreground min-w-[6.5rem] text-xs">
                        {dateStr}
                      </span>
                      {icon}
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
