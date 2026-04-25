"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDatabase } from "@/lib/DatabaseProvider";
import { useRxQuery } from "@/lib/useRxQuery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Plus, Search, MapPin, CalendarIcon, Info } from "lucide-react";
import { formatMoney, convert, formatDateShortWithFormat } from "@/lib/format";
import { useExchangeRates } from "@/lib/useExchangeRates";
import type {
  AccommodationDocument,
  ExpenseDocument,
  StopDocument,
  TransportDocument,
  TripDocument,
} from "@/lib/rxdb-schema";
import { useSettings } from "@/lib/SettingsProvider";
import { generateId } from "@/lib/rxdb-database";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";

type TripStatusFilter = "all" | "upcoming" | "ongoing" | "past";

export default function HomePage() {
  const t = useTranslations("home");
  const tStats = useTranslations("tripStats");
  const db = useDatabase();
  const router = useRouter();
  const { defaultCurrency, dateFormat } = useSettings();
  const { rates } = useExchangeRates();
  const trips = useRxQuery<TripDocument>(
    db.trips.find().sort({ updatedAt: "desc" }),
  );
  const stops = useRxQuery<StopDocument>(db.stops.find());
  const expenses = useRxQuery<ExpenseDocument>(db.expenses.find());
  const accommodations = useRxQuery<AccommodationDocument>(
    db.accommodations.find(),
  );
  const transports = useRxQuery<TransportDocument>(db.transports.find());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TripStatusFilter>("all");
  const [isCreating, setIsCreating] = useState(false);
  const [tripName, setTripName] = useState("");
  const [firstStopName, setFirstStopName] = useState("");
  const [tripStartDate, setTripStartDate] = useState("");

  const cards = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    // Build stop->tripId lookup for accommodations and transports
    const stopTripMap = new Map<string, string>();
    stops.forEach((stop) => stopTripMap.set(stop.id, stop.tripId));

    return trips
      .map((trip) => {
        const tripStops = stops.filter((stop) => stop.tripId === trip.id);
        const startDate = trip.startDate;
        const status: Exclude<TripStatusFilter, "all"> =
          !startDate || startDate > today
            ? "upcoming"
            : "ongoing";

        const expenseTotal = expenses
          .filter((expense) => expense.tripId === trip.id)
          .reduce(
            (sum, expense) =>
              sum + convert(expense.price, expense.currency, defaultCurrency, rates),
            0,
          );

        const accommodationTotal = accommodations
          .filter((acc) => stopTripMap.get(acc.stopId) === trip.id)
          .reduce(
            (sum, acc) =>
              sum + convert(acc.price, acc.currency, defaultCurrency, rates),
            0,
          );

        const transportTotal = transports
          .filter((trans) => stopTripMap.get(trans.stopId) === trip.id)
          .reduce(
            (sum, trans) =>
              sum + convert(trans.price, trans.currency, defaultCurrency, rates),
            0,
          );

        const total = expenseTotal + accommodationTotal + transportTotal;

        return {
          trip,
          status,
          stopCount: tripStops.length,
          startDate,
          endDate: undefined as string | undefined,
          stopNames: tripStops.map((stop) => stop.name).join(" · "),
          total,
        };
      })
      .filter((card) =>
        card.trip.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
      .filter((card) => filter === "all" || card.status === filter);
  }, [accommodations, defaultCurrency, expenses, filter, rates, search, stops, transports, trips]);

  const createTrip = async () => {
    const now = Date.now();
    const nextTripId = generateId();
    let createdTrip: Awaited<ReturnType<typeof db.trips.insert>> | null = null;
    try {
      createdTrip = await db.trips.insert({
        id: nextTripId,
        name: tripName.trim() || t("newTripName"),
        startDate: tripStartDate || undefined,
        createdAt: now,
        updatedAt: now,
      });

      if (firstStopName.trim()) {
        await db.stops.insert({
          id: generateId(),
          name: firstStopName.trim(),
          tripId: nextTripId,
          createdAt: now,
          updatedAt: now,
        });
      }
    } catch (error) {
      console.error(error);
      if (createdTrip) {
        await createdTrip.remove();
      }
      toast.error(t("createTripError"));
      return;
    }

    posthog.capture("trip_created", {
      has_first_stop: Boolean(firstStopName.trim()),
      has_start_date: Boolean(tripStartDate),
    });
    setTripName("");
    setFirstStopName("");
    setTripStartDate("");
    setIsCreating(false);
    router.push(`/trip/${nextTripId}`);
  };

  return (
    <div className="container flex flex-col gap-8 py-8 sm:py-12">
      <div className="mb- 28 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <section className="animate-fade-in flex flex-col gap-3">
          <p className="text-accent text-2xs font-medium tracking-[0.2em] uppercase">
            {t("heroEyebrow")}
          </p>
          <h1 className="font-serif text-4xl font-semibold">
            {t("heroTitle")}
          </h1>
          <p className="text-muted-foreground">{t("heroDescription")}</p>
        </section>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger
            render={
              <Button size="lg">
                <Plus data-icon="inline-start" />
                {t("planTrip")}
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("createTripTitle")}</DialogTitle>
              <DialogDescription>
                {t("createTripDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <Input
                value={tripName}
                onChange={(event) => setTripName(event.target.value)}
                placeholder={t("tripNamePlaceholder")}
              />
              <Input
                value={firstStopName}
                onChange={(event) => setFirstStopName(event.target.value)}
                placeholder={t("firstStopPlaceholder")}
              />
              <Input
                value={tripStartDate}
                onChange={(event) => setTripStartDate(event.target.value)}
                type="date"
                placeholder={t("tripStartDatePlaceholder")}
              />
              <Button onClick={createTrip}>{t("createAndOpen")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3 md:max-w-3xl md:flex-row md:items-center">
            <div className="relative w-full md:flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                placeholder={t("searchPlaceholder")}
              />
            </div>
            <Tabs
              value={filter}
              onValueChange={(value) => setFilter(value as TripStatusFilter)}
              className="w-full md:w-auto"
            >
              <TabsList className="bg-muted/70 h-10 w-full rounded-xl md:w-auto">
                {(
                  ["all", "upcoming", "ongoing", "past"] as TripStatusFilter[]
                ).map((value) => (
                  <TabsTrigger key={value} value={value} className="capitalize">
                    {t(`filters.${value}`)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </section>

      {cards.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="text-muted-foreground flex flex-col items-center gap-3 py-12 text-center">
            <p>{t("empty.noTrips")}</p>
            <Button onClick={() => setIsCreating(true)}>{t("planTrip")}</Button>
          </CardContent>
        </Card>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Card
              key={card.trip.id}
              className="group shadow-soft hover:shadow-lift overflow-hidden border py-0 transition-all duration-300"
              onClick={() => router.push(`/trip/${card.trip.id}`)}
            >
              <CardHeader className="gradient-hero relative h-32 p-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.4),transparent_60%)]" />
                <span className="bg-background/90 text-foreground absolute top-3 right-3 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase">
                  {t(`filters.${card.status}`)}
                </span>
                <div className="text-foreground/80 absolute bottom-3 left-4 flex items-center gap-1.5 text-xs">
                  <MapPin className="h-3.5 w-3.5" />
                  {t("stopCount", { count: card.stopCount })}
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <CardTitle className="group-hover:text-primary font-serif text-2xl leading-tight font-semibold transition-colors">
                  {card.trip.name}
                </CardTitle>
                <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-sm">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {card.startDate
                    ? card.endDate
                      ? `${formatDateShortWithFormat(card.startDate, dateFormat)} - ${formatDateShortWithFormat(card.endDate, dateFormat)}`
                      : formatDateShortWithFormat(card.startDate, dateFormat)
                    : t("noDatesYet")}
                </div>
                {card.stopCount > 0 && (
                  <p className="text-muted-foreground mt-3 line-clamp-1 text-sm">
                    {card.stopNames}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-1.5">
                  <p className="text-foreground text-lg font-semibold">
                    ~{formatMoney(card.total, defaultCurrency)}
                  </p>
                  <TooltipProvider>
                    <TooltipRoot>
                      <TooltipTrigger
                        className="text-muted-foreground hover:text-foreground cursor-default"
                        aria-label={tStats("estimationTooltip")}
                      >
                        <Info className="h-3.5 w-3.5" />
                      </TooltipTrigger>
                      <TooltipContent>
                        {tStats("estimationTooltip")}
                      </TooltipContent>
                    </TooltipRoot>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
