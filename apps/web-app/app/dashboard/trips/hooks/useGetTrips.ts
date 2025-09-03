'use client';
import { useQuery } from '@tanstack/react-query';
import { getTrips } from '@/app/dashboard/trips/actions/getTrips';

export type TripsResponse = Awaited<ReturnType<typeof getTrips>>;

const useGetTrips = () => {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => getTrips(),
  });
};

export default useGetTrips;
