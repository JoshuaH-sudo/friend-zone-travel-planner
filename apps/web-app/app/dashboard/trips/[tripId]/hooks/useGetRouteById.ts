'use client';
import { useQuery } from '@tanstack/react-query';
import { getRouteById } from '@/app/dashboard/trips/[tripId]/actions/getRouteById';

export type GetRouteByIdResponse = Awaited<ReturnType<typeof getRouteById>>;

interface UseGetRouteByIdProps {
  routeId: string;
  enabled?: boolean;
}

const useGetRouteById = ({ routeId, enabled = true }: UseGetRouteByIdProps) => {
  return useQuery({
    queryKey: ['route', routeId],
    queryFn: async () => getRouteById({ routeId }),
    enabled: !!routeId && enabled,
  });
};

export default useGetRouteById;
