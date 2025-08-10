'use client';

import { getFlightPrices, FlightResponse } from '@/lib/actions/serpapi';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

type UseGetFlightPricesOptions = UseQueryOptions<
  FlightResponse,
  Error,
  FlightResponse
>;

interface FlightParams {
  fromLocation?: string;
  toLocation?: string;
  departureDate?: string;
  returnDate?: string;
}

const useGetFlightPrices = (
  params: FlightParams,
  options?: Partial<UseGetFlightPricesOptions>
) => {
  const { fromLocation, toLocation, departureDate, returnDate } = params;
  
  return useQuery({
    enabled: !!(fromLocation && toLocation && departureDate),
    queryKey: ['flight-prices', fromLocation, toLocation, departureDate, returnDate],
    queryFn: async () => {
      if (!fromLocation || !toLocation || !departureDate) {
        throw new Error('Missing required parameters');
      }
      
      const response = await getFlightPrices(fromLocation, toLocation, departureDate, returnDate);
      
      if (response.status === 'ERROR') {
        throw new Error(response.message || 'Failed to fetch flight prices');
      }
      
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

export default useGetFlightPrices;

