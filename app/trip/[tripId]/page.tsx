"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  convert,
  daysBetween,
  formatDateShort,
  formatMoney,
} from "@/lib/format";
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
import {
  ArrowLeft,
  Bed,
  Calendar,
  CalendarDays,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plane,
  Wallet,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import posthog from "posthog-js";
import { addDays, format as formatDateFns } from "date-fns";

type TabId = "overview" | "itinerary" | "map" | "budget";

/**
 * Shift a stored "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM" string by `deltaDays`.
 * Assumes a well-formed date string matching the repo's storage format.
 * Returns the original value unchanged if the format is not recognised.
 */
function shiftDateTimeByDays(value: string, deltaDays: number): string {
  const [datePart, timePart] = value.split("T");
  if (!datePart || !/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return value;
  }
  const [y, m, d] = datePart.split("-").map(Number);
  const shifted = addDays(new Date(y, m - 1, d), deltaDays);
  const newDate = formatDateFns(shifted, "yyyy-MM-dd");
  return timePart ? `${newDate}T${timePart}` : newDate;
}

export default function TripPage() {
  const params = useParams();
  const router = useRouter();
  const db = useDatabase();
  const { timezone, defaultCurrency } = useSettings();
  const tripId = params.tripId as string;
  const [tab, setTab] = useState<TabId>("overview");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditingStartDate, setIsEditingStartDate] = useState(false);
  const [startDateDraft, setStartDateDraft] = useState("");
  const startDateInputRef = useRef<HTMLInputElement | null>(null);
  const {
    trip,
    stops,
    accommodationsByStop,
    transportsByStop,
    expenses,
    loading,
  } = useTripData(tripId, { database: db });

  useEffect(() => {
    if (!loading && trip) {
      posthog.capture("trip_viewed", {
        trip_id: tripId,
        stop_count: stops.length,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

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

  /** Date range derived from all item dates (accommodations + transports). */
  const range = useMemo(() => {
    const allDates: string[] = [
      ...Object.values(accommodationsByStop)
        .flat()
        .flatMap((a) => [a.checkIn.slice(0, 10), a.checkOut.slice(0, 10)]),
      ...Object.values(transportsByStop)
        .flat()
        .map((t) => t.departureDateTime.slice(0, 10)),
    ].filter(Boolean);

    if (allDates.length === 0) {
      return { start: null as string | null, end: null as string | null };
    }
    const sorted = [...allDates].sort();
    return { start: sorted[0], end: sorted[sorted.length - 1] };
  }, [accommodationsByStop, transportsByStop]);

  const totalDays =
    range.start && range.end ? daysBetween(range.start, range.end) + 1 : 0;

  /** Shift all item dates so that the trip begins on `newStartDate`. */
  const shiftAllItems = async (newStartDate: string) => {
    const currentStart =
      trip?.startDate ??
      (range.start || null);

    if (!currentStart) {
      // No existing reference point — just update startDate.
      await trip?.patch({ startDate: newStartDate, updatedAt: Date.now() });
      return;
    }

    const [cy, cm, cd] = currentStart.split("-").map(Number);
    const [ny, nm, nd] = newStartDate.split("-").map(Number);
    const currentMs = new Date(cy, cm - 1, cd).getTime();
    const newMs = new Date(ny, nm - 1, nd).getTime();
    const deltaDays = Math.round((newMs - currentMs) / (1000 * 60 * 60 * 24));

    if (deltaDays === 0) {
      await trip?.patch({ startDate: newStartDate, updatedAt: Date.now() });
      return;
    }

    const allAccommodations = Object.values(accommodationsByStop).flat();
    const allTransports = Object.values(transportsByStop).flat();
    const expensesWithDate = expenses.filter((e) => e.date);

    await Promise.all([
      trip?.patch({ startDate: newStartDate, updatedAt: Date.now() }),
      ...allAccommodations.map((acc) =>
        acc.patch({
          checkIn: shiftDateTimeByDays(acc.checkIn, deltaDays),
          checkOut: shiftDateTimeByDays(acc.checkOut, deltaDays),
          updatedAt: Date.now(),
        }),
      ),
      ...allTransports.map((trans) =>
        trans.patch({
          departureDateTime: shiftDateTimeByDays(
            trans.departureDateTime,
            deltaDays,
          ),
          arrivalDateTime: trans.arrivalDateTime
            ? shiftDateTimeByDays(trans.arrivalDateTime, deltaDays)
            : undefined,
          updatedAt: Date.now(),
        }),
      ),
      ...expensesWithDate.map((exp) =>
        exp.patch({
          date: exp.date ? shiftDateTimeByDays(exp.date, deltaDays) : undefined,
          updatedAt: Date.now(),
        }),
      ),
    ]);
  };

  const handleStartDateSave = async () => {
    if (!startDateDraft) {
      setIsEditingStartDate(false);
      return;
    }
    await shiftAllItems(startDateDraft);
    setIsEditingStartDate(false);
    posthog.capture("trip_start_date_set", {
      trip_id: tripId,
    });
  };

  const beginEditingStartDate = () => {
    setStartDateDraft(
      trip?.startDate ?? range.start ?? new Date().toISOString().slice(0, 10),
    );
    setIsEditingStartDate(true);
    setTimeout(() => startDateInputRef.current?.focus(), 50);
  };

  const addStop = async (name: string) => {
    await db.stops.insert({
      id: generateId(),
      name,
      tripId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    posthog.capture("stop_added", { trip_id: tripId });
  };

  const onAddAccommodation = async (
    stopId: string,
    payload: {
      name: string;
      price: number;
      currency: string;
      checkIn: string;
      checkOut: string;
      timezone?: string;
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
      timezone: payload.timezone,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    posthog.capture("accommodation_added", {
      trip_id: tripId,
      currency: payload.currency || defaultCurrency,
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
      timezone?: string;
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
      timezone: payload.timezone,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    posthog.capture("transport_added", {
      trip_id: tripId,
      currency: payload.currency || defaultCurrency,
    });
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading trip...</p>;
  }

  if (!trip) {
    return <p className="text-muted-foreground">Trip not found.</p>;
  }

  const displayStartDate = trip.startDate ?? range.start;

  return (
    <div>
      <section className="gradient-hero text-primary-foreground">
        <div className="container py-8 sm:py-12">
          <Link
            href="/"
            className="text-foreground/80 hover:text-primary-foreground mb-6 inline-flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> All trips
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-foreground/60 mb-2 text-xs tracking-widest uppercase">
                Trip
              </p>
              <EditableText
                value={trip.name}
                onSave={async (nextName) => {
                  await trip.patch({ name: nextName, updatedAt: Date.now() });
                }}
                className="text-foreground font-serif text-4xl leading-tight font-semibold sm:text-6xl"
              />
              <div className="text-foreground/85 mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {isEditingStartDate ? (
                    <form
                      className="inline-flex items-center gap-1"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await handleStartDateSave();
                      }}
                    >
                      <input
                        ref={startDateInputRef}
                        type="date"
                        value={startDateDraft}
                        onChange={(e) => setStartDateDraft(e.target.value)}
                        className="bg-background/20 text-foreground rounded px-1 py-0.5 text-sm"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="ghost"
                        className="text-foreground/80 h-6 px-1 text-xs"
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-foreground/60 h-6 px-1 text-xs"
                        onClick={() => setIsEditingStartDate(false)}
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      className="hover:text-primary-foreground inline-flex items-center gap-1 text-left"
                      onClick={beginEditingStartDate}
                      title="Set start date to move the entire trip"
                    >
                      {displayStartDate
                        ? `${formatDateShort(displayStartDate)}${range.end && range.end !== displayStartDate ? ` – ${formatDateShort(range.end)}` : ""}`
                        : "Set start date"}
                      <Pencil className="h-3 w-3 opacity-60" />
                    </button>
                  )}
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
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    {totalDays} days
                  </span>
                )}
              </div>
            </div>
            <DropdownMenu data-cy="trip-actions">
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-background/15 hover:bg-background/25 text-primary-foreground border-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                }
              ></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={async () => {
                      await exportTripJson(db, trip.id);
                      posthog.capture("trip_exported_json", {
                        trip_id: trip.id,
                      });
                    }}
                  >
                    Export JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await copyShareLink(db, trip.id);
                      posthog.capture("share_link_copied", {
                        trip_id: trip.id,
                      });
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
          <TabsList className="mb-6 grid w-full grid-cols-4 sm:inline-grid sm:w-auto">
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
                posthog.capture("trip_deleted", {
                  trip_id: trip.id,
                  stop_count: stops.length,
                });
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
