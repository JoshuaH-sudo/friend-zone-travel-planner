'use client';
import { useQuery } from '@tanstack/react-query';
import { getTrips } from '@/app/[locale]/(main-product)/app/trips/actions/getTrips';

export type TripWithRoutes = Awaited<ReturnType<typeof getTrips>>[0];

const useGetTripsWithRoutes = (userId: number) => {
  return useQuery({
    queryKey: ['trips', userId],
    queryFn: async () => getTrips(userId),
  });
};

export default useGetTripsWithRoutes;
