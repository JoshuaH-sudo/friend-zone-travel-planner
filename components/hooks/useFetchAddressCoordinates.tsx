import { getAddressCoordinates } from '@/lib/actions';
import { useQuery } from '@tanstack/react-query';

const useFetchAddress = (address: string) => {
  return useQuery({
    enabled: false,
    queryKey: ['address'],
    queryFn: () => getAddressCoordinates(address),
  });
};

export default useFetchAddress;
