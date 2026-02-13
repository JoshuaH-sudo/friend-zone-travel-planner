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
  // Should calculate the total cost of each currency across all stops, accommodations, and transports in the trip
  // Number of stops, accommodations, and transports
  // Start and end date of the trip (based on the earliest and latest stop dates)
  // This should update in real-time as the trip data changes
  const stats = useMemo(() => {
    const currencyTotals: Record<string, number> = {};
    let stopCount = 0;
    let accommodationCount = 0;
    let transportCount = 0;
    let startDate: string | null = null;
    let endDate: string | null = null;

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

    return {
      currencyTotals,
      stopCount,
      accommodationCount,
      transportCount,
      startDate,
      endDate,
    };
  }, [trip, stops, accommodationsByStop, transportsByStop]);

  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-xl font-bold">Trip Stats</h2>
      <p>
        <strong>Stops:</strong> {stats.stopCount} |{" "}
        <strong>Accommodations:</strong> {stats.accommodationCount} |{" "}
        <strong>Transports:</strong> {stats.transportCount}
      </p>
      <p>
        <strong>Start Date:</strong> {stats.startDate || "N/A"} |{" "}
        <strong>End Date:</strong> {stats.endDate || "N/A"}
      </p>
      <div className="mt-2">
        <strong>Total Cost:</strong>
        <ul className="ml-4 list-disc">
          {Object.entries(stats.currencyTotals).map(([currency, total]) => (
            <li key={currency}>
              {currency} {total.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
