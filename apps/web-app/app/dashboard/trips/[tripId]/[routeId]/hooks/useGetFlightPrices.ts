'use client';

import { useQuery } from '@tanstack/react-query';
import { getFlightPrices } from '@/lib/actions/serpapi';

interface UseGetFlightPricesProps {
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  returnDate?: string;
  enabled?: boolean;
}

const useGetFlightPrices = ({
  fromLocation,
  toLocation,
  departureDate,
  returnDate,
  enabled = true,
}: UseGetFlightPricesProps) => {
  return useQuery({
    queryKey: ['flightPrices', fromLocation, toLocation, departureDate, returnDate],
    queryFn: async () => {
      if (!fromLocation || !toLocation || !departureDate) {
        return { status: 'ERROR', message: 'Missing required parameters' };
      }
      
      return getFlightPrices(fromLocation, toLocation, departureDate, returnDate);
    },
    enabled: enabled && !!fromLocation && !!toLocation && !!departureDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });
};

export default useGetFlightPrices;

