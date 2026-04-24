"use client";

import type {
  AccommodationDocumentType,
  ExpenseDocumentType,
  StopDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Transport } from "./Transport";
import { useTranslations } from "next-intl";
import { useSettings } from "@/lib/SettingsProvider";
import posthog from "posthog-js";
import { Expenses } from "./Expenses";
import { Input } from "@base-ui/react";
import { Bed, Plus, Plane, CreditCard, GripVertical } from "lucide-react";
import { Accommodation } from "./Accommodation";
import { AccommodationForm } from "./AccommodationForm";
import { TransportForm } from "./TransportForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { capitalize } from "@/lib/utils";

type OverviewTabProps = {
  stops: StopDocumentType[];
  accommodationsByStop: Record<string, AccommodationDocumentType[]>;
  transportsByStop: Record<string, TransportDocumentType[]>;
  expensesByStop?: Record<string, ExpenseDocumentType[]>;
  onAddStop: (name: string) => Promise<void>;
  onAddAccommodation: (
    stopId: string,
    payload: {
      name: string;
      price: number;
      currency: string;
      checkIn: string;
      checkOut: string;
      timezone?: string;
    },
  ) => Promise<void>;
  onAddTransport: (
    stopId: string,
    payload: {
      name: string;
      price: number;
      currency: string;
      departureDateTime: string;
      arrivalDateTime: string;
      timezone?: string;
    },
  ) => Promise<void>;
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

/** Returns the earliest item date for the given stop, or empty string if none. */
function getStopEarliestDate(
  stopId: string,
  accommodationsByStop: Record<string, AccommodationDocumentType[]>,
  transportsByStop: Record<string, TransportDocumentType[]>,
): string {
  const dates = [
    ...(accommodationsByStop[stopId] || []).map((a) => a.checkIn),
    ...(transportsByStop[stopId] || []).map((t) => t.departureDateTime),
  ].filter(Boolean);
  return dates.length > 0 ? dates.sort()[0] : "";
}

export const OverviewTab = ({
  stops,
  accommodationsByStop,
  transportsByStop,
  expensesByStop = {},
  onAddStop,
  onAddAccommodation,
  onAddTransport,
}: OverviewTabProps & {
  expensesByStop?: Record<string, ExpenseDocumentType[]>;
}) => {
  const t = useTranslations("overviewTab");
  const { defaultCurrency, timezone } = useSettings();

  // Sort stops by the earliest item date within each stop; stops with no items
  // fall back to createdAt ordering (stable, predictable).
  const sortedStops = useMemo(() => {
    return [...stops].sort((a, b) => {
      const aDate = getStopEarliestDate(a.id, accommodationsByStop, transportsByStop);
      const bDate = getStopEarliestDate(b.id, accommodationsByStop, transportsByStop);
      if (aDate && bDate) return aDate.localeCompare(bDate);
      if (aDate) return -1;
      if (bDate) return 1;
      return a.createdAt - b.createdAt;
    });
  }, [stops, accommodationsByStop, transportsByStop]);

  const [addingAccommodationForStopId, setAddingAccommodationForStopId] =
    useState<string | null>(null);
  const [addingTransportForStopId, setAddingTransportForStopId] = useState<
    string | null
  >(null);
  const [newStopName, setNewStopName] = useState("");

  const handleEditStopName = async (stopId: string, newName: string) => {
    const stop = stops.find((s) => s.id === stopId);
    if (!stop) return;
    await stop.patch({ name: newName, updatedAt: Date.now() });
  };

  const handleDeleteStop = async (stopId: string) => {
    const stop = stops.find((s) => s.id === stopId);
    if (!stop) return;
    const accoms = accommodationsByStop[stopId] || [];
    const trans = transportsByStop[stopId] || [];
    await Promise.all([
      ...accoms.map((a) => a.remove()),
      ...trans.map((t) => t.remove()),
      stop.remove(),
    ]);
    posthog.capture("stop_deleted", {
      accommodations_deleted: accoms.length,
      transports_deleted: trans.length,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {sortedStops.map((stop, index) => (
          <StopCard
            key={stop.id}
            index={index + 1}
            stop={stop}
            accommodations={accommodationsByStop[stop.id] || []}
            transports={transportsByStop[stop.id] || []}
            expenses={expensesByStop[stop.id] || []}
            defaultCurrency={defaultCurrency}
            timezone={timezone}
            addingAccommodation={addingAccommodationForStopId === stop.id}
            addingTransport={addingTransportForStopId === stop.id}
            onStartAddAccommodation={() =>
              setAddingAccommodationForStopId(stop.id)
            }
            onCancelAddAccommodation={() =>
              setAddingAccommodationForStopId(null)
            }
            onStartAddTransport={() => setAddingTransportForStopId(stop.id)}
            onCancelAddTransport={() => setAddingTransportForStopId(null)}
            onAddAccommodation={async (data) => {
              await onAddAccommodation(stop.id, data);
              setAddingAccommodationForStopId(null);
            }}
            onAddTransport={async (data) => {
              await onAddTransport(stop.id, data);
              setAddingTransportForStopId(null);
            }}
            onEditStopName={(newName) => handleEditStopName(stop.id, newName)}
            onDeleteStop={() => handleDeleteStop(stop.id)}
          />
        ))}
      </div>
      {sortedStops.length === 0 ? (
        <div className="text-muted-foreground rounded-xl border border-dashed p-6 text-center">
          {t("empty.noStops")}
        </div>
      ) : null}
      <form
        className="bg-muted/30 flex flex-wrap items-end gap-2 rounded-2xl border p-3"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!newStopName.trim()) return;
          await onAddStop(newStopName.trim());
          setNewStopName("");
        }}
      >
        <Input
          value={newStopName}
          onChange={(event) => setNewStopName(event.target.value)}
          placeholder={t("addStop.placeholder")}
          className="bg-input min-w-56 flex-1 rounded-xl"
        />
        <Button type="submit" className="h-10 rounded-xl px-4">
          {t("addStop.submit")}
        </Button>
      </form>
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          {t("actions.backToTop")}
        </Button>
      </div>
    </div>
  );
};

/** Inline stop card used within OverviewTab. */
function StopCard({
  index,
  stop,
  accommodations,
  transports,
  expenses,
  defaultCurrency,
  timezone,
  addingAccommodation,
  addingTransport,
  onStartAddAccommodation,
  onCancelAddAccommodation,
  onStartAddTransport,
  onCancelAddTransport,
  onAddAccommodation,
  onAddTransport,
  onEditStopName,
  onDeleteStop,
}: {
  index: number;
  stop: StopDocumentType;
  accommodations: AccommodationDocumentType[];
  transports: TransportDocumentType[];
  expenses: ExpenseDocumentType[];
  defaultCurrency: string;
  timezone: string;
  addingAccommodation: boolean;
  addingTransport: boolean;
  onStartAddAccommodation: () => void;
  onCancelAddAccommodation: () => void;
  onStartAddTransport: () => void;
  onCancelAddTransport: () => void;
  onAddAccommodation: (data: {
    name: string;
    price: number;
    currency: string;
    checkIn: string;
    checkOut: string;
    timezone?: string;
  }) => Promise<void>;
  onAddTransport: (data: {
    name: string;
    price: number;
    currency: string;
    departureDateTime: string;
    arrivalDateTime: string;
    timezone?: string;
  }) => Promise<void>;
  onEditStopName: (newName: string) => Promise<void>;
  onDeleteStop: () => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const t = useTranslations("overviewTab");

  const today = getTodayDate();

  // Compute a date range summary from item dates for display in the stop card header.
  const allItemDates = [
    ...accommodations.map((a) => a.checkIn),
    ...accommodations.map((a) => a.checkOut),
    ...transports.map((tr) => tr.departureDateTime),
    ...transports.map((tr) => tr.arrivalDateTime),
  ].filter((d): d is string => Boolean(d));

  let dateRangeSummary = "";
  if (allItemDates.length > 0) {
    const sorted = [...allItemDates].sort();
    const earliest = sorted[0].slice(0, 10);
    const latest = sorted[sorted.length - 1].slice(0, 10);
    const earliestYear = earliest.slice(0, 4);
    const latestYear = latest.slice(0, 4);
    if (earliest === latest) {
      dateRangeSummary = format(
        new Date(`${earliest}T00:00:00`),
        "MMM d, yyyy",
      );
    } else if (earliestYear !== latestYear) {
      dateRangeSummary = `${format(new Date(`${earliest}T00:00:00`), "MMM d, yyyy")} – ${format(new Date(`${latest}T00:00:00`), "MMM d, yyyy")}`;
    } else {
      dateRangeSummary = `${format(new Date(`${earliest}T00:00:00`), "MMM d")} – ${format(new Date(`${latest}T00:00:00`), "MMM d")}`;
    }
  }

  // Default date/time for new item forms: use earliest item date or today.
  const defaultDate =
    allItemDates.length > 0
      ? allItemDates.sort()[0].slice(0, 10)
      : today;

  return (
    <Card className="rounded-2xl pb-0 shadow-md">
      <CardHeader className="flex flex-row items-center gap-1 pb-4">
        <div className="flex w-full flex-row items-start gap-2">
          <GripVertical className="text-muted-foreground mt-1 cursor-default opacity-30" />
          <div className="bg-primary-muted text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif font-semibold">
            {index}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {isEditing ? (
              <form
                className="flex items-center gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!editDraft.trim()) return;
                  await onEditStopName(editDraft.trim());
                  setIsEditing(false);
                }}
              >
                <Input
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  className="h-8 px-2 py-1 font-serif text-2xl"
                  maxLength={100}
                  autoFocus
                />
                <Button size="icon-sm" variant="ghost" type="submit">
                  ✓
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                >
                  ✕
                </Button>
              </form>
            ) : (
              <>
                <CardTitle className="truncate font-serif text-2xl">
                  {capitalize(stop.name)}
                </CardTitle>
                {dateRangeSummary && (
                  <p className="text-muted-foreground truncate text-sm">
                    {dateRangeSummary}
                  </p>
                )}
              </>
            )}
          </div>
          {!isEditing && (
            <div className="ml-2 flex gap-1">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => {
                  setEditDraft(stop.name);
                  setIsEditing(true);
                }}
              >
                ✏
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="text-destructive"
                onClick={async () => {
                  if (
                    confirm(
                      "Delete this stop and all its items? This cannot be undone.",
                    )
                  ) {
                    await onDeleteStop();
                  }
                }}
              >
                🗑
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="bg-secondary/30 space-y-3 border-t px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-4">
          <section>
            <div className="mt-2 flex flex-col gap-2">
              <div className="text-muted-foreground flex items-center gap-1 text-xs font-light uppercase">
                <Bed className="text-muted-foreground h-4 w-4" />
                <p>{t("sections.stays")}</p>
              </div>
              {accommodations.length === 0 && (
                <p className="text-muted-foreground">{t("sections.noStays")}</p>
              )}
              {accommodations.map((item) => (
                <Accommodation key={item.id} accommodation={item} />
              ))}
              {addingAccommodation ? (
                <div className="border-border/50 bg-card rounded-xl border p-3">
                  <AccommodationForm
                    initialValues={{
                      name: "",
                      price: 0,
                      currency: defaultCurrency,
                      checkIn: `${defaultDate}T14:00`,
                      checkOut: `${defaultDate}T11:00`,
                      timezone,
                    }}
                    onSubmit={onAddAccommodation}
                    onCancel={onCancelAddAccommodation}
                    submitLabel={t("actions.addStay")}
                    cancelLabel={t("actions.cancel")}
                    autoFocusName
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onStartAddAccommodation}
                  className="text-muted-foreground w-fit px-0"
                >
                  <Plus className="h-4 w-4" />
                  {t("actions.addStay")}
                </Button>
              )}
            </div>
          </section>
          <section>
            <div className="text-muted-foreground flex items-center gap-1 text-xs font-light uppercase">
              <Plane className="text-muted-foreground h-4 w-4" />
              <p>{t("sections.journeys")}</p>
            </div>
            {transports.length === 0 && (
              <p className="text-muted-foreground">
                {t("sections.noJourneys")}
              </p>
            )}
            <div className="mt-2 flex flex-col gap-2">
              {transports.map((item) => (
                <Transport key={item.id} transport={item} />
              ))}
              {addingTransport ? (
                <div className="border-border/50 bg-card rounded-xl border p-3">
                  <TransportForm
                    initialValues={{
                      name: "",
                      type: "flight",
                      price: 0,
                      currency: defaultCurrency,
                      departureDateTime: `${defaultDate}T12:00`,
                      arrivalDateTime: `${defaultDate}T13:00`,
                      timezone,
                    }}
                    onSubmit={async (data) => {
                      await onAddTransport({
                        name: data.name,
                        price: data.price,
                        currency: data.currency,
                        departureDateTime: data.departureDateTime,
                        arrivalDateTime: data.arrivalDateTime ?? "",
                        timezone: data.timezone,
                      });
                    }}
                    onCancel={onCancelAddTransport}
                    submitLabel={t("actions.addJourney")}
                    cancelLabel={t("actions.cancel")}
                    autoFocusName
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onStartAddTransport}
                  className="text-muted-foreground w-fit px-0"
                >
                  <Plus className="h-4 w-4" />
                  {t("actions.addJourney")}
                </Button>
              )}
            </div>
          </section>
          <section>
            <div className="text-muted-foreground flex items-center gap-1 text-xs font-light uppercase">
              <CreditCard className="text-muted-foreground h-4 w-4" />
              <p>{t("sections.expenses")}</p>
            </div>
            <Expenses
              stopId={stop.id}
              tripId={stop.tripId}
              expenses={expenses}
              defaultCurrency={defaultCurrency}
            />
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
