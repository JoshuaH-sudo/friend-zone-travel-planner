"use client";
import {
  TripDocumentType,
  StopDocumentType,
  AccommodationDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { useMemo } from "react";

export function TripStats({
  trip,
  stops,
  accommodationsByStop,
  transportsByStop,
}: {
  trip: TripDocumentType | null;
  stops: StopDocumentType[];
  accommodationsByStop: Record<string, AccommodationDocumentType[]>;
  transportsByStop: Record<string, TransportDocumentType[]>;
}) {
  const stats = useMemo(() => {
    const currencyTotals: Record<string, number> = {};
    let stopCount = 0;
    let accommodationCount = 0;
    let transportCount = 0;
    let startDate: string | null = null;
    let endDate: string | null = null;
    let totalDays = 0;

    if (!trip) {
      return {
        currencyTotals,
        stopCount,
        accommodationCount,
        transportCount,
        startDate,
        endDate,
      };
    }

    stops.forEach((stop) => {
      stopCount++;

      if (!startDate || stop.date < startDate) {
        startDate = stop.date;
      }
      if (!endDate || stop.date > endDate) {
        endDate = stop.date;
      }

      (accommodationsByStop[stop.id] || []).forEach((acc) => {
        accommodationCount++;
        currencyTotals[acc.currency] =
          (currencyTotals[acc.currency] || 0) + acc.price;
      });

      (transportsByStop[stop.id] || []).forEach((trans) => {
        transportCount++;
        currencyTotals[trans.currency] =
          (currencyTotals[trans.currency] || 0) + trans.price;
      });
    });

    totalDays =
      startDate && endDate
        ? (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24) +
          1
        : 0;

    return {
      currencyTotals,
      stopCount,
      accommodationCount,
      transportCount,
      startDate,
      endDate,
      totalDays,
    };
  }, [trip, stops, accommodationsByStop, transportsByStop]);

  return (
    <div className="w-full space-y-2 rounded-lg border p-4">
      <h2 className="text-xl font-bold">Trip Stats</h2>
      <div>
        <p>
          <strong>Destination:</strong> {stats.stopCount}
        </p>
        <p>
          <strong>Accommodations:</strong> {stats.accommodationCount}
        </p>
        <p>
          <strong>Transports:</strong> {stats.transportCount}
        </p>
      </div>
      <div>
        <p>
          {stats.startDate || "N/A"} | {stats.endDate || "N/A"}
        </p>
        <p>
          <strong>Days:</strong> {stats.totalDays}
        </p>
      </div>
      <div className="mt-2">
        <strong>Total Cost:</strong>
        <ul className="ml-4 list-disc">
          {Object.entries(stats.currencyTotals).map(([currency, total]) => (
            <li key={currency}>
              <strong>{currency}:</strong> {total.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
