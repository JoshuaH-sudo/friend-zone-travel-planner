"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDatabase } from "@/lib/DatabaseProvider";
import { useTripData } from "@/components/hooks/useTripData";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditableText } from "./components/EditableText";
import { OverviewTab } from "./components/OverviewTab";
import { ItineraryTab } from "./components/ItineraryTab";
import { MapTab } from "./components/MapTab";
import { BudgetTab } from "./components/BudgetTab";
import { copyShareLink, exportTripJson } from "@/lib/share";
import { exportTripToIcal } from "@/lib/ical-export";
import { useSettings } from "@/lib/SettingsProvider";
import { convert, formatMoney } from "@/lib/format";
import { generateId } from "@/lib/rxdb-database";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type TabId = "overview" | "itinerary" | "map" | "budget";

export default function TripPage() {
  const params = useParams();
  const router = useRouter();
  const db = useDatabase();
  const { timezone, defaultCurrency } = useSettings();
  const tripId = params.tripId as string;
  const [tab, setTab] = useState<TabId>("overview");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { trip, stops, accommodationsByStop, transportsByStop, expenses, loading } =
    useTripData(tripId, { database: db });

  const totals = useMemo(() => {
    const accommodationTotal = Object.values(accommodationsByStop)
      .flat()
      .reduce(
        (sum, item) => sum + convert(item.price, item.currency, defaultCurrency),
        0,
      );
    const transportTotal = Object.values(transportsByStop)
      .flat()
      .reduce(
        (sum, item) => sum + convert(item.price, item.currency, defaultCurrency),
        0,
      );
    const expenseTotal = expenses.reduce(
      (sum, item) => sum + convert(item.price, item.currency, defaultCurrency),
      0,
    );
    return accommodationTotal + transportTotal + expenseTotal;
  }, [accommodationsByStop, defaultCurrency, expenses, transportsByStop]);

  const tripDates = useMemo(() => {
    if (stops.length === 0) {
      return "No dates yet";
    }
    const sorted = [...stops].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0]?.date;
    const last = sorted[sorted.length - 1]?.date;
    return first === last ? first : `${first} → ${last}`;
  }, [stops]);

  const addStop = async (name: string, date: string) => {
    await db.stops.insert({
      id: generateId(),
      name,
      date,
      tripId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  const onAddAccommodation = async (stopId: string, name: string, date: string) => {
    await db.accommodations.insert({
      id: generateId(),
      stopId,
      name,
      checkIn: date,
      checkOut: date,
      price: 0,
      currency: defaultCurrency,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  const onAddTransport = async (stopId: string, name: string, date: string) => {
    await db.transports.insert({
      id: generateId(),
      stopId,
      name,
      type: "flight",
      departureDateTime: `${date}T12:00`,
      arrivalDateTime: `${date}T13:00`,
      price: 0,
      currency: defaultCurrency,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading trip...</p>;
  }

  if (!trip) {
    return <p className="text-muted-foreground">Trip not found.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="gradient-hero text-primary-foreground rounded-3xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <EditableText
              value={trip.name}
              onSave={async (nextName) => {
                await trip.patch({ name: nextName, updatedAt: Date.now() });
              }}
              className="font-serif text-4xl font-semibold"
            />
            <p className="text-primary-foreground/90">{tripDates}</p>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="bg-primary-foreground/15 rounded-full px-3 py-1">
                {stops.length} stops
              </span>
              <span className="bg-primary-foreground/15 rounded-full px-3 py-1">
                {Object.values(transportsByStop).flat().length} transports
              </span>
              <span className="bg-primary-foreground/15 rounded-full px-3 py-1">
                {formatMoney(totals, defaultCurrency)}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="secondary">Actions</Button>} />
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={async () => {
                    await exportTripJson(db, trip.id);
                  }}
                >
                  Export JSON
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    await copyShareLink(db, trip.id);
                    toast.success("Share link copied.");
                  }}
                >
                  Copy share link
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    await exportTripToIcal(db, trip.id, timezone);
                  }}
                >
                  Export iCal
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete trip
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {(["overview", "itinerary", "map", "budget"] as TabId[]).map((tabId) => (
          <Button
            key={tabId}
            variant={tabId === tab ? "default" : "outline"}
            onClick={() => setTab(tabId)}
            className="capitalize"
          >
            {tabId}
          </Button>
        ))}
      </section>

      {tab === "overview" ? (
        <OverviewTab
          stops={stops}
          accommodationsByStop={accommodationsByStop}
          transportsByStop={transportsByStop}
          onAddStop={addStop}
          onAddAccommodation={onAddAccommodation}
          onAddTransport={onAddTransport}
        />
      ) : null}

      {tab === "itinerary" ? (
        <ItineraryTab
          stops={stops}
          accommodationsByStop={accommodationsByStop}
          transportsByStop={transportsByStop}
          expenses={expenses}
        />
      ) : null}

      {tab === "map" ? <MapTab stops={stops} /> : null}

      {tab === "budget" ? (
        <BudgetTab
          trip={trip}
          accommodationsByStop={accommodationsByStop}
          transportsByStop={transportsByStop}
          expenses={expenses}
        />
      ) : null}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the trip and all linked stops/items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                await trip.remove();
                router.push("/");
              }}
            >
              Delete trip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
