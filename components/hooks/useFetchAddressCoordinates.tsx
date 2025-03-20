import { getAddressCoordinates } from '@/lib/actions';
import { useQuery } from '@tanstack/react-query';

const useFetchAddress = (address: string) => {
  return useQuery({
    enabled: false,
    queryKey: ['address', address],
    queryFn: async () => { 
      const response = await getAddressCoordinates(address)
      if (response.status === "ZERO_RESULTS") throw new Error("No results found")
      console.log(response)
      return response.results[0]
    },
  });
};

export default useFetchAddress;
