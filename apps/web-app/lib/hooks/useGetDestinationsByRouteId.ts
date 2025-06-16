'use client';
import { useQuery } from '@tanstack/react-query';
import { getDestinationsByRouteId } from '../actions/destinations';

const useGetDestinationsByRouteId = (routeId: number) =>
  useQuery({
    queryKey: ['destinations', routeId],
    queryFn: () => getDestinationsByRouteId(routeId),
    enabled: !!routeId,
  });

export default useGetDestinationsByRouteId;
