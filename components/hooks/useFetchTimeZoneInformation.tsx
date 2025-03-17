import { Coordinates, getTimezoneInformation } from '@/lib/actions';
import { useQuery } from '@tanstack/react-query';

const useFetchTimezoneInformation = (coordinates?: Coordinates) => {
  return useQuery({
    enabled: !!coordinates,
    queryKey: ['timezone', coordinates?.lat, coordinates?.lng],
    queryFn: () => getTimezoneInformation(coordinates!),
  });
};

export default useFetchTimezoneInformation;
