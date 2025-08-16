'use client';

import { useQuery } from '@tanstack/react-query';
import { getAccommodationPrices } from '@/lib/actions/serpapi';

interface UseGetAccommodationPricesProps {
  location: string;
  checkInDate: string;
  checkOutDate: string;
  enabled?: boolean;
}

const useGetAccommodationPrices = ({
  location,
  checkInDate,
  checkOutDate,
  enabled = true,
}: UseGetAccommodationPricesProps) => {
  return useQuery({
    queryKey: ['accommodationPrices', location, checkInDate, checkOutDate],
    queryFn: async () => {
      if (!location || !checkInDate || !checkOutDate) {
        return { status: 'ERROR', message: 'Missing required parameters' };
      }

      return getAccommodationPrices(location, checkInDate, checkOutDate);
    },
    enabled: enabled && !!location && !!checkInDate && !!checkOutDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });
};

export default useGetAccommodationPrices;
