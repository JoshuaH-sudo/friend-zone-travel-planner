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
import { convert, daysBetween, formatDateShort, formatMoney } from "@/lib/format";
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
import Link from "next/link";
import { ArrowLeft, Bed, Calendar, MapPin, MoreHorizontal, Plane, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabId = "overview" | "itinerary" | "map" | "budget";

export default function TripPage() {
  const params = useParams();
  const router = useRouter();
  const db = useDatabase();
  const { timezone, defaultCurrency } = useSettings();
  const tripId = params.tripId as string;
  const [tab, setTab] = useState<TabId>("overview");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const {
    trip,
    stops,
    accommodationsByStop,
    transportsByStop,
    expenses,
    loading,
  } = useTripData(tripId, { database: db });

  const totals = useMemo(() => {
    const accommodationCost = Object.values(accommodationsByStop)
      .flat()
      .reduce(
        (sum, item) =>
          sum + convert(item.price, item.currency, defaultCurrency),
        0,
      );
    const transportCost = Object.values(transportsByStop)
      .flat()
      .reduce(
        (sum, item) =>
          sum + convert(item.price, item.currency, defaultCurrency),
        0,
      );
    const expenseCost = expenses.reduce(
      (sum, item) => sum + convert(item.price, item.currency, defaultCurrency),
      0,
    );
    const totalStays = Object.values(accommodationsByStop).flat().length;
    const totalJourneys = Object.values(transportsByStop).flat().length;
    return {
      accommodationCost,
      transportCost,
      expenseCost,
      grandCost: accommodationCost + transportCost + expenseCost,
      totalStays,
      totalJourneys,
    };
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

  const onAddAccommodation = async (
    stopId: string,
    payload: {
      name: string;
      price: number;
      currency: string;
      checkIn: string;
      checkOut: string;
    },
  ) => {
    await db.accommodations.insert({
      id: generateId(),
      stopId,
      name: payload.name,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      price: payload.price,
      currency: payload.currency || defaultCurrency,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  const onAddTransport = async (
    stopId: string,
    payload: {
      name: string;
      price: number;
      currency: string;
      departureDateTime: string;
      arrivalDateTime: string;
    },
  ) => {
    await db.transports.insert({
      id: generateId(),
      stopId,
      name: payload.name,
      type: "flight",
      departureDateTime: payload.departureDateTime,
      arrivalDateTime: payload.arrivalDateTime,
      price: payload.price,
      currency: payload.currency || defaultCurrency,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  const range = (() => {
    if (!stops.length)
      return { start: null as string | null, end: null as string | null };
    const sorted = [...stops].sort((a, b) => a.date.localeCompare(b.date));
    return { start: sorted[0].date, end: sorted[sorted.length - 1].date };
  })();
  
    const totalDays = range.start && range.end ? daysBetween(range.start, range.end) + 1 : 0;

  if (loading) {
    return <p className="text-muted-foreground">Loading trip...</p>;
  }

  if (!trip) {
    return <p className="text-muted-foreground">Trip not found.</p>;
  }

  return (
    <div>
      <section className="gradient-hero text-primary-foreground">
        <div className="container py-8 sm:py-12">
          <Link
            href="/"
            className="text-primary-foreground/80 hover:text-primary-foreground mb-6 inline-flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> All trips
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-primary-foreground/70 mb-2 text-xs tracking-widest uppercase">
                Trip
              </p>
              <EditableText
                value={trip.name}
                onSave={async (nextName) => {
                  await trip.patch({ name: nextName, updatedAt: Date.now() });
                }}
                className="font-serif text-4xl leading-tight font-semibold sm:text-6xl"
              />
              <div className="text-primary-foreground/85 mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {range.start
                    ? `${formatDateShort(range.start)} – ${formatDateShort(range.end!)}`
                    : "No dates"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {stops.length} stops
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Bed className="h-4 w-4" /> {totals.totalStays} stays
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Plane className="h-4 w-4" /> {totals.totalJourneys} journeys
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Wallet className="h-4 w-4" /> ~$
                  {Math.round(totals.grandCost).toLocaleString()}
                </span>
                {totalDays > 0 && (
                  <span className="opacity-80">{totalDays} days</span>
                )}
              </div>
            </div>
            <DropdownMenu data-cy="trip-actions">
              <DropdownMenuTrigger render={
                <Button variant="secondary" size="icon" className="bg-background/15 hover:bg-background/25 text-primary-foreground border-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }>
              </DropdownMenuTrigger>
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
        </div>
      </section>

      <div className="container py-8">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto sm:inline-grid mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              stops={stops}
              accommodationsByStop={accommodationsByStop}
              transportsByStop={transportsByStop}
              onAddStop={addStop}
              onAddAccommodation={onAddAccommodation}
              onAddTransport={onAddTransport}
            />
          </TabsContent>
          <TabsContent value="itinerary">
            <ItineraryTab
              stops={stops}
              accommodationsByStop={accommodationsByStop}
              transportsByStop={transportsByStop}
              expenses={expenses}
            />
          </TabsContent>
          <TabsContent value="map">
            <MapTab stops={stops} />
          </TabsContent>
          <TabsContent value="budget">
            <BudgetTab
              trip={trip}
              accommodationsByStop={accommodationsByStop}
              transportsByStop={transportsByStop}
              expenses={expenses}
            />
          </TabsContent>
        </Tabs>
      </div>

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
