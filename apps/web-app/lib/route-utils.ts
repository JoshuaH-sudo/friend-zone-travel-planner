import { Database } from '@/lib/supabase/database.types';

// Custom types that match the actual query result structure
type AccommodationQueryResult = {
  id: string;
  name: string;
  address: string;
  cost: number;
  currency: string;
  href: string | null;
  type: string;
  friend_id: string | null;
  created_at: string;
  updated_at: string;
};

type TransportQueryResult = {
  id: string;
  name: string;
  address: string;
  cost: number;
  currency: string;
  href: string | null;
  type: string;
  departure_at: string | null;
  arrival_at: string | null;
  duration: number | null;
  created_at: string;
  updated_at: string;
};

// Type definitions for route data with nested relationships based on actual query
type RouteWithDestinations = Database['public']['Tables']['routes']['Row'] & {
  destinations?: {
    id: string;
    location: string;
    latitude: number;
    longitude: number;
    order: number;
    created_at: string | null;
    updated_at: string | null;
    days: number;
    friends?: {
      id: string;
      name: string;
    }[];
    accommodations?: AccommodationQueryResult[];
    transports?: TransportQueryResult[];
  }[];
};

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
  route: RouteWithDestinations
): CostSummary[] {
  const costMap = new Map<string, number>();

  // Iterate through all destinations in the route
  route.destinations?.forEach((destination) => {
    // Add accommodation costs
    destination.accommodations?.forEach((accommodation) => {
      const currency = accommodation.currency;
      const cost = accommodation.cost;
      // Default to 1 night if days is not specified
      const numberOfNights = destination.days || 1;
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
export function routeHasCosts(route: RouteWithDestinations): boolean {
  return (
    route.destinations?.some(
      (destination) =>
        (destination.accommodations && destination.accommodations.length > 0) ||
        (destination.transports && destination.transports.length > 0)
    ) || false
  );
}
