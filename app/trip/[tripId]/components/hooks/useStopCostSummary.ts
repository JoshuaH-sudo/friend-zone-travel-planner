import { useMemo } from "react";
import type {
  AccommodationDocumentType,
  ExpenseDocumentType,
  TransportDocumentType,
} from "@/lib/rxdb-schema";
import { useExchangeRates } from "@/lib/useExchangeRates";
import { sumByCurrency, sumInCurrency } from "../utils/tripCostUtils";

type UseStopCostSummaryResult = {
  /** Per-currency raw totals for the stop. */
  stopCurrencyTotals: Record<string, number>;
  /** Grand total converted to the user's preferred currency. */
  stopEstimatedTotal: number;
};

/**
 * Computes per-currency totals and estimated total for a single stop.
 */
export function useStopCostSummary(
  accommodations: AccommodationDocumentType[],
  transports: TransportDocumentType[],
  expenses: ExpenseDocumentType[],
  defaultCurrency: string,
): UseStopCostSummaryResult {
  const { rates } = useExchangeRates();

  const stopCurrencyTotals = useMemo(
    () => sumByCurrency([...accommodations, ...transports, ...expenses]),
    [accommodations, transports, expenses],
  );

  const stopEstimatedTotal = useMemo(
    () =>
      sumInCurrency(
        [...accommodations, ...transports, ...expenses],
        defaultCurrency,
        rates,
      ),
    [accommodations, transports, expenses, defaultCurrency, rates],
  );

  return { stopCurrencyTotals, stopEstimatedTotal };
}
