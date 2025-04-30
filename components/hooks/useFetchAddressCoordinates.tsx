import { getAddressCoordinates } from '@/lib/actions';
import { useQuery } from '@tanstack/react-query';

const useFetchAddress = (address: string) => {
  return useQuery({
    // Only want to fetch the address once the user has entered it completely
    enabled: !!address, // Ensure the query runs only when an address is provided
    queryKey: ['address', address], // Cache results based on the address
    queryFn: async () => { 
      const response = await getAddressCoordinates(address);

      if (response.status === "ERROR") throw new Error(response.message);

      return response.results!
    },
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep unused data in cache for 10 minutes
  });
};

export default useFetchAddress;
