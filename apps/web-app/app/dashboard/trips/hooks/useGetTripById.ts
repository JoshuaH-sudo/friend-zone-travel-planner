'use client';
import { useQuery } from '@tanstack/react-query';
import { getTripById } from '@/app/dashboard/trips/actions/getTripById';

export type TripWithRoutes = Awaited<ReturnType<typeof getTripById>>;

interface UseGetTripByIdProps {
  tripId: string;
  enabled?: boolean;
}

const useGetTripById = ({ tripId, enabled = true }: UseGetTripByIdProps) => {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => getTripById({ tripId }),
    enabled: !!tripId && enabled,
  });
};

export default useGetTripById;
