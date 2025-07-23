'use client';
import { useQuery } from '@tanstack/react-query';
import { getTrips } from '@/app/(main-product)/home/trips/actions/getTrips';

export type TripWithRoutes = Awaited<ReturnType<typeof getTrips>>[0];

const useGetTripsWithRoutes = () => {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => getTrips(),
  });
};

export default useGetTripsWithRoutes;
