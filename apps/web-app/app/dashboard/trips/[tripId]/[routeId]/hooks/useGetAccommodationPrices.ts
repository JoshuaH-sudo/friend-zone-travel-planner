'use client';

import { getAccommodationPrices, AccommodationResponse } from '@/lib/actions/serpapi';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

type UseGetAccommodationPricesOptions = UseQueryOptions<
  AccommodationResponse,
  Error,
  AccommodationResponse
>;

interface AccommodationParams {
  location?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

const useGetAccommodationPrices = (
  params: AccommodationParams,
  options?: Partial<UseGetAccommodationPricesOptions>
) => {
  const { location, checkInDate, checkOutDate } = params;
  
  return useQuery({
    enabled: !!(location && checkInDate && checkOutDate),
    queryKey: ['accommodation-prices', location, checkInDate, checkOutDate],
    queryFn: async () => {
      if (!location || !checkInDate || !checkOutDate) {
        throw new Error('Missing required parameters');
      }
      
      const response = await getAccommodationPrices(location, checkInDate, checkOutDate);
      
      if (response.status === 'ERROR') {
        throw new Error(response.message || 'Failed to fetch accommodation prices');
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

export default useGetAccommodationPrices;

