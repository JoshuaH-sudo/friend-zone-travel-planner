"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDatabase } from "@/lib/DatabaseProvider";
import { useRxQuery } from "@/lib/useRxQuery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDateRange } from "@/lib/format";
import { Plus, Search } from "lucide-react";
import { formatMoney, convert } from "@/lib/format";
import type { ExpenseDocument, StopDocument, TripDocument } from "@/lib/rxdb-schema";
import { useSettings } from "@/lib/SettingsProvider";
import { generateId } from "@/lib/rxdb-database";

type TripStatusFilter = "all" | "upcoming" | "ongoing" | "past";

export default function HomePage() {
  const db = useDatabase();
  const router = useRouter();
  const { defaultCurrency } = useSettings();
  const trips = useRxQuery<TripDocument>(db.trips.find().sort({ updatedAt: "desc" }));
  const stops = useRxQuery<StopDocument>(db.stops.find());
  const expenses = useRxQuery<ExpenseDocument>(db.expenses.find());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TripStatusFilter>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [tripName, setTripName] = useState("");
  const [firstStopName, setFirstStopName] = useState("");
  const [firstStopDate, setFirstStopDate] = useState("");

  const cards = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return trips
      .map((trip) => {
        const tripStops = stops
          .filter((stop) => stop.tripId === trip.id)
          .sort((a, b) => a.date.localeCompare(b.date));
        const minDate = tripStops[0]?.date;
        const maxDate = tripStops[tripStops.length - 1]?.date;
        const status: Exclude<TripStatusFilter, "all"> =
          !minDate || minDate > today
            ? "upcoming"
            : maxDate && maxDate < today
              ? "past"
              : "ongoing";
        const total = expenses
          .filter((expense) => expense.tripId === trip.id)
          .reduce(
            (sum, expense) =>
              sum + convert(expense.price, expense.currency, defaultCurrency),
            0,
          );
        return {
          trip,
          status,
          stopCount: tripStops.length,
          dateRange: formatDateRange(minDate, maxDate),
          total,
        };
      })
      .filter((card) =>
        card.trip.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
      .filter((card) => filter === "all" || card.status === filter);
  }, [defaultCurrency, expenses, filter, search, stops, trips]);

  const createTrip = async () => {
    const now = Date.now();
    const nextTripId = generateId();
    await db.trips.insert({
      id: nextTripId,
      name: tripName.trim() || "New Trip",
      createdAt: now,
      updatedAt: now,
    });

    if (firstStopName.trim()) {
      await db.stops.insert({
        id: generateId(),
        name: firstStopName.trim(),
        date: firstStopDate || new Date().toISOString().slice(0, 10),
        tripId: nextTripId,
        createdAt: now,
        updatedAt: now,
      });
    }

    setTripName("");
    setFirstStopName("");
    setFirstStopDate("");
    setIsCreating(false);
    router.push(`/trip/${nextTripId}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="animate-fade-in flex flex-col gap-3">
        <h1 className="font-serif text-4xl font-semibold">Your trips</h1>
        <p className="text-muted-foreground">
          Plan your next adventure with friends, all in one place.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-10"
              placeholder="Search trips"
            />
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger
              render={
                <Button>
                  <Plus data-icon="inline-start" />
                  New trip
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new trip</DialogTitle>
                <DialogDescription>
                  Start with a name and optionally your first stop.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <Input
                  value={tripName}
                  onChange={(event) => setTripName(event.target.value)}
                  placeholder="Trip name"
                />
                <Input
                  value={firstStopName}
                  onChange={(event) => setFirstStopName(event.target.value)}
                  placeholder="First stop (optional)"
                />
                <Input
                  value={firstStopDate}
                  onChange={(event) => setFirstStopDate(event.target.value)}
                  type="date"
                />
                <Button onClick={createTrip}>Create and open</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "upcoming", "ongoing", "past"] as TripStatusFilter[]).map(
            (value) => (
              <Button
                key={value}
                variant={filter === value ? "default" : "outline"}
                onClick={() => setFilter(value)}
                className="capitalize"
              >
                {value}
              </Button>
            ),
          )}
        </div>
      </section>

      {cards.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="text-muted-foreground flex flex-col items-center gap-3 py-12 text-center">
            <p>No trips yet.</p>
            <Button onClick={() => setIsCreating(true)}>Plan a trip</Button>
          </CardContent>
        </Card>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Card
              key={card.trip.id}
              className="shadow-soft hover:shadow-elegant cursor-pointer rounded-2xl transition"
              onClick={() => router.push(`/trip/${card.trip.id}`)}
            >
              <CardHeader className="flex flex-col gap-2">
                <CardTitle className="font-serif text-2xl">{card.trip.name}</CardTitle>
                <p className="text-muted-foreground text-sm">{card.dateRange}</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-muted-foreground text-sm">
                  {card.stopCount} {card.stopCount === 1 ? "stop" : "stops"}
                </p>
                <p className="text-foreground text-lg font-semibold">
                  {formatMoney(card.total, defaultCurrency)}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
