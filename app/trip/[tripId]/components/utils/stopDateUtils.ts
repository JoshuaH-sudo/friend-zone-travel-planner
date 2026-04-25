import type {
  AccommodationDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { format } from "date-fns";

/**
 * Collects all item date strings for a set of accommodations and transports.
 * Used both for sorting stops and for computing date range summaries.
 */
export function getAllItemDates(
  accommodations: AccommodationDocumentType[],
  transports: TransportDocumentType[],
): string[] {
  return [
    ...accommodations.map((a) => a.checkIn),
    ...accommodations.map((a) => a.checkOut),
    ...transports.map((t) => t.departureDateTime),
    ...transports.map((t) => t.arrivalDateTime),
  ].filter((d): d is string => Boolean(d));
}

/**
 * Returns the earliest item date string for a given stop,
 * or an empty string if the stop has no items.
 */
export function getStopEarliestDate(
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

/**
 * Derives a human-readable date-range summary string from a list of date strings.
 * Returns an empty string when there are no dates.
 */
export function computeStopDateRangeSummary(allItemDates: string[]): string {
  if (allItemDates.length === 0) return "";

  const sorted = [...allItemDates].sort();
  const earliest = sorted[0].slice(0, 10);
  const latest = sorted[sorted.length - 1].slice(0, 10);

  const earliestYear = earliest.slice(0, 4);
  const latestYear = latest.slice(0, 4);

  if (earliest === latest) {
    return format(new Date(`${earliest}T00:00:00`), "MMM d, yyyy");
  }
  if (earliestYear !== latestYear) {
    return `${format(new Date(`${earliest}T00:00:00`), "MMM d, yyyy")} – ${format(new Date(`${latest}T00:00:00`), "MMM d, yyyy")}`;
  }
  return `${format(new Date(`${earliest}T00:00:00`), "MMM d")} – ${format(new Date(`${latest}T00:00:00`), "MMM d")}`;
}
