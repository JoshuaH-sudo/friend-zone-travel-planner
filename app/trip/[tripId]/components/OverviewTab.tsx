"use client";

import type {
  AccommodationDocumentType,
  ExpenseDocumentType,
  StopDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSettings } from "@/lib/SettingsProvider";
import posthog from "posthog-js";
import { Input } from "@base-ui/react";
import { Button } from "@/components/ui/button";
import { StopCard, getAllItemDates } from "./StopCard";

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

/** Returns the earliest item date for the given stop, or empty string if none. */
function getStopEarliestDate(
  stopId: string,
  accommodationsByStop: Record<string, AccommodationDocumentType[]>,
  transportsByStop: Record<string, TransportDocumentType[]>,
): string {
  const dates = getAllItemDates(
    accommodationsByStop[stopId] || [],
    transportsByStop[stopId] || [],
  );
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
      const aDate = getStopEarliestDate(
        a.id,
        accommodationsByStop,
        transportsByStop,
      );
      const bDate = getStopEarliestDate(
        b.id,
        accommodationsByStop,
        transportsByStop,
      );
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
        className="bg-muted/30 flex flex-wrap justify-center gap-2 rounded-2xl border p-3"
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
          type="text"
          className="bg-input flex-1 rounded-xl px-4 py-2"
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

