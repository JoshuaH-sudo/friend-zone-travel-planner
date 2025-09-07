'use client';
import { useQuery } from '@tanstack/react-query';
import { getDestinationsByRouteId } from '../actions/destinations';

export type GetDestinationsByRouteIdResponse = Awaited<ReturnType<typeof getDestinationsByRouteId>>;
export type FullDestination = GetDestinationsByRouteIdResponse[number];

const useGetDestinationsByRouteId = (routeId: string | null) =>
  useQuery({
    queryKey: ['destinations', routeId],
    queryFn: () => getDestinationsByRouteId(routeId!),
    enabled: !!routeId,
  });

export default useGetDestinationsByRouteId;
