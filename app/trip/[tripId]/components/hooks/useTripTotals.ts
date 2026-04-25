import { useMemo } from "react";
import type {
  AccommodationDocumentType,
  ExpenseDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { convert, daysBetween } from "@/lib/format";
import { useExchangeRates } from "@/lib/useExchangeRates";
import { useSettings } from "@/lib/SettingsProvider";

type UseTripTotalsResult = {
  accommodationCost: number;
  transportCost: number;
  expenseCost: number;
  grandCost: number;
  totalStays: number;
  totalJourneys: number;
  /** Date range derived from all item dates. */
  range: { start: string | null; end: string | null };
  /** Number of days between range.start and range.end (inclusive). */
  totalDays: number;
};

/**
 * Computes trip-level cost totals and the date range from all item dates.
 */
export function useTripTotals(
  accommodationsByStop: Record<string, AccommodationDocumentType[]>,
  transportsByStop: Record<string, TransportDocumentType[]>,
  expenses: ExpenseDocumentType[],
): UseTripTotalsResult {
  const { defaultCurrency } = useSettings();
  const { rates } = useExchangeRates();

  const totals = useMemo(() => {
    const allAccommodations = Object.values(accommodationsByStop).flat();
    const allTransports = Object.values(transportsByStop).flat();

    const accommodationCost = allAccommodations.reduce(
      (sum, item) =>
        sum + convert(item.price, item.currency, defaultCurrency, rates),
      0,
    );
    const transportCost = allTransports.reduce(
      (sum, item) =>
        sum + convert(item.price, item.currency, defaultCurrency, rates),
      0,
    );
    const expenseCost = expenses.reduce(
      (sum, item) =>
        sum + convert(item.price, item.currency, defaultCurrency, rates),
      0,
    );
    const totalStays = allAccommodations.length;
    const totalJourneys = allTransports.length;

    return {
      accommodationCost,
      transportCost,
      expenseCost,
      grandCost: accommodationCost + transportCost + expenseCost,
      totalStays,
      totalJourneys,
    };
  }, [accommodationsByStop, transportsByStop, expenses, defaultCurrency, rates]);

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

  return { ...totals, range, totalDays };
}
