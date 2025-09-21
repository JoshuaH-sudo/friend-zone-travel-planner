import { TripByIdResponse } from '@/app/dashboard/trips/actions/getTripById';
import { differenceInDays } from 'date-fns';

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
};

// Interface for cost summary by currency
export interface CostSummary {
  currency: string;
  total: number;
  symbol: string;
}

/**
 * Calculate total costs for a route grouped by currency
 * @param route Route object with destinations, accommodations, and transports
 * @returns Array of cost summaries grouped by currency
 */
export function calculateRouteCosts(
  route: TripByIdResponse['routes'][0]
): CostSummary[] {
  const costMap = new Map<string, number>();

  // Iterate through all destinations in the route
  route.destinations?.forEach((destination) => {
    destination.accommodations?.forEach((accommodation) => {
      const currency = accommodation.currency;
      const cost = accommodation.cost;

      if (cost <= 0 || !cost) return;

      // Default to 1 night if days is not specified
      const { check_in, check_out } = accommodation;
      const numberOfNights =
        check_in && check_out
          ? differenceInDays(new Date(check_out), new Date(check_in))
          : 1;
      const totalCost = cost * numberOfNights;
      costMap.set(currency, (costMap.get(currency) || 0) + totalCost);
    });

    // Add transport costs
    destination.transports?.forEach((transport) => {
      const currency = transport.currency;
      const cost = transport.cost;
      costMap.set(currency, (costMap.get(currency) || 0) + cost);
    });
  });

  // Convert map to array of cost summaries
  const costSummaries: CostSummary[] = Array.from(costMap.entries()).map(
    ([currency, total]) => ({
      currency,
      total,
      symbol: CURRENCY_SYMBOLS[currency] || currency,
    })
  );

  // Sort by currency code for consistent display
  return costSummaries.sort((a, b) => a.currency.localeCompare(b.currency));
}

/**
 * Format a cost amount for display
 * @param amount The cost amount
 * @param currency The currency code
 * @returns Formatted cost string
 */
export function formatCost(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  // Handle different currency formatting
  switch (currency) {
    case 'JPY':
      // Japanese Yen typically doesn't use decimal places
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    default:
      // Most currencies use 2 decimal places
      return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Check if a route has any costs
 * @param route Route object with destinations, accommodations, and transports
 * @returns True if the route has any costs, false otherwise
 */
export function routeHasCosts(route: TripByIdResponse['routes'][0]): boolean {
  return (
    route.destinations?.some(
      (destination) =>
        (destination.accommodations && destination.accommodations.length > 0) ||
        (destination.transports && destination.transports.length > 0)
    ) || false
  );
}
