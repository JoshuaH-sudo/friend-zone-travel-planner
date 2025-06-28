"use client";

import { getAddressCoordinates } from '@/lib/actions/google';
import { GeocodeResult } from '@googlemaps/google-maps-services-js';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

type UseGetAddressCoordinatesOptions = UseQueryOptions<
  GeocodeResult,
  Error,
  GeocodeResult
>;

const useGetAddressCoordinates = (
  address?: string,
  options?: Partial<UseGetAddressCoordinatesOptions>
) => {
  return useQuery({
    enabled: !!address, // Only fetch if address is provided
    // Only want to fetch the address once the user has entered it completely
    queryKey: ['address', address], // Cache results based on the address
    queryFn: async () => {
      const response = await getAddressCoordinates(address!);

      if (response.status === 'ERROR') throw new Error(response.message);

      return response.results!;
    },
    ...options,
  });
};

export default useGetAddressCoordinates;
