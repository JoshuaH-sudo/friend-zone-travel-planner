import { useMemo } from "react";
import type {
  AccommodationDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import {
  getAllItemDates,
  computeStopDateRangeSummary,
} from "../utils/stopDateUtils";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

type UseStopDateRangeResult = {
  allItemDates: string[];
  dateRangeSummary: string;
  /** A sensible default date for new item forms: earliest item date or today. */
  defaultDate: string;
};

/**
 * Derives date-range display data for a stop from its accommodations and transports.
 */
export function useStopDateRange(
  accommodations: AccommodationDocumentType[],
  transports: TransportDocumentType[],
): UseStopDateRangeResult {
  return useMemo(() => {
    const allItemDates = getAllItemDates(accommodations, transports);
    const dateRangeSummary = computeStopDateRangeSummary(allItemDates);
    const defaultDate =
      allItemDates.length > 0
        ? allItemDates.sort()[0].slice(0, 10)
        : getTodayDate();
    return { allItemDates, dateRangeSummary, defaultDate };
  }, [accommodations, transports]);
}
