import { getAddressCoordinates } from '@/lib/actions';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';


const useFetchAddress = (address?: string) => {
  return useQuery({
    enabled: !!address, // Only fetch if address is provided
    // Only want to fetch the address once the user has entered it completely
    queryKey: ['address', address], // Cache results based on the address
    queryFn: async () => { 
      const response = await getAddressCoordinates(address!);

      if (response.status === "ERROR") throw new Error(response.message);

      return response.results!
    },
  });
};

export default useFetchAddress;
