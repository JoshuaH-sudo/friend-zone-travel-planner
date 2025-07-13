'use client';
import { useQuery } from '@tanstack/react-query';
import { getDestinationsByRouteId } from '../actions/destinations';

const useGetDestinationsByRouteId = (routeId: string) =>
  useQuery({
    queryKey: ['destinations', routeId],
    queryFn: () => getDestinationsByRouteId(routeId),
    enabled: !!routeId,
  });

export default useGetDestinationsByRouteId;
