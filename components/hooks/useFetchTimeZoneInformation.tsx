import { Coordinates, getTimezoneInformation } from '@/lib/actions';
import { useQuery } from '@tanstack/react-query';

const useFetchTimezoneInformation = (coordinates?: Coordinates) => {
  return useQuery({
    enabled: !!coordinates,
    queryKey: ['timezone', coordinates?.lat, coordinates?.lng],
    queryFn: async () => {
      const response = await getTimezoneInformation(coordinates!)
      console.log(response);

      if (response.status === "ERROR") throw new Error(response.message);

      return response.results!
    },
  });
};

export default useFetchTimezoneInformation;
