import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type {
  AccommodationDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { getStoredDateTimeTimestamp } from "@/lib/datetime-utils";
import { formatStoredDateTime } from "@/lib/datetime-utils";
import { useSettings } from "@/lib/SettingsProvider";

type TripItem = {
  model: TransportDocumentType | AccommodationDocumentType;
  id: string;
  type: "transport" | "accommodation";
  date: string;
};

function getItemRange(item: TripItem) {
  if (item.type === "accommodation") {
    const accommodation = item.model as AccommodationDocumentType;
    const startTime = getStoredDateTimeTimestamp(accommodation.checkIn, {
      dateOnlyBoundary: "start",
    });
    const endTime = getStoredDateTimeTimestamp(accommodation.checkOut, {
      dateOnlyBoundary: "end",
    });
    return startTime <= endTime
      ? {
          start: accommodation.checkIn,
          end: accommodation.checkOut,
          startTime,
          endTime,
        }
      : {
          start: accommodation.checkOut,
          end: accommodation.checkIn,
          startTime: getStoredDateTimeTimestamp(accommodation.checkOut, {
            dateOnlyBoundary: "start",
          }),
          endTime: getStoredDateTimeTimestamp(accommodation.checkIn, {
            dateOnlyBoundary: "end",
          }),
        };
  }

  const transport = item.model as TransportDocumentType;
  const startTime = getStoredDateTimeTimestamp(transport.departureDateTime, {
    dateOnlyBoundary: "start",
  });
  const arrival = transport.arrivalDateTime || transport.departureDateTime;
  const endTime = getStoredDateTimeTimestamp(arrival, {
    dateOnlyBoundary: "end",
  });
  return {
    start: startTime <= endTime ? transport.departureDateTime : arrival,
    end: startTime <= endTime ? arrival : transport.departureDateTime,
    startTime: Math.min(startTime, endTime),
    endTime: Math.max(startTime, endTime),
  };
}

/**
 * Detects scheduling overlaps between accommodations and transports.
 * Returns a map of item id → array of human-readable overlap warning strings.
 */
export function useItemOverlapDetection(
  accommodations: AccommodationDocumentType[],
  transports: TransportDocumentType[],
): Record<string, string[]> {
  const t = useTranslations("stopItems");
  const { dateFormat } = useSettings();

  const formatDateLabel = (value: string) =>
    formatStoredDateTime(value, dateFormat);

  const formatRangeLabel = (start: string, end: string) => {
    if (start === end) return formatDateLabel(start);
    return t("dateRangeSummary", {
      start: formatDateLabel(start),
      end: formatDateLabel(end),
    });
  };

  const items: TripItem[] = useMemo(
    () =>
      [
        ...transports.map((trans) => ({
          model: trans,
          id: trans.id,
          type: "transport" as const,
          date: trans.departureDateTime,
        })),
        ...accommodations.map((acc) => ({
          model: acc,
          id: acc.id,
          type: "accommodation" as const,
          date: acc.checkIn,
        })),
      ].sort(
        (a, b) =>
          getStoredDateTimeTimestamp(a.date, { dateOnlyBoundary: "start" }) -
          getStoredDateTimeTimestamp(b.date, { dateOnlyBoundary: "start" }),
      ),
    [accommodations, transports],
  );

  return useMemo(() => {
    const overlapWarnings: Record<string, string[]> = {};
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const first = items[i];
        const second = items[j];
        const firstRange = getItemRange(first);
        const secondRange = getItemRange(second);

        const overlaps =
          firstRange.startTime <= secondRange.endTime &&
          secondRange.startTime <= firstRange.endTime;

        if (!overlaps) continue;

        const overlapStart = new Date(
          Math.max(firstRange.startTime, secondRange.startTime),
        );
        const overlapEnd = new Date(
          Math.min(firstRange.endTime, secondRange.endTime),
        );

        overlapWarnings[first.id] = [
          ...(overlapWarnings[first.id] || []),
          t("overlapWarningSummary", {
            item: first.model.name,
            other: second.model.name,
            range: formatRangeLabel(
              overlapStart.toISOString(),
              overlapEnd.toISOString(),
            ),
          }),
        ];

        overlapWarnings[second.id] = [
          ...(overlapWarnings[second.id] || []),
          t("overlapWarningSummary", {
            item: second.model.name,
            other: first.model.name,
            range: formatRangeLabel(
              overlapStart.toISOString(),
              overlapEnd.toISOString(),
            ),
          }),
        ];
      }
    }
    return overlapWarnings;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, t]);
}

/** Sorted items list, exposed so StopItems can reuse the same sort. */
export function useSortedTripItems(
  accommodations: AccommodationDocumentType[],
  transports: TransportDocumentType[],
): TripItem[] {
  return useMemo(
    () =>
      [
        ...transports.map((trans) => ({
          model: trans,
          id: trans.id,
          type: "transport" as const,
          date: trans.departureDateTime,
        })),
        ...accommodations.map((acc) => ({
          model: acc,
          id: acc.id,
          type: "accommodation" as const,
          date: acc.checkIn,
        })),
      ].sort(
        (a, b) =>
          getStoredDateTimeTimestamp(a.date, { dateOnlyBoundary: "start" }) -
          getStoredDateTimeTimestamp(b.date, { dateOnlyBoundary: "start" }),
      ),
    [accommodations, transports],
  );
}

export type { TripItem };
export { getItemRange };
