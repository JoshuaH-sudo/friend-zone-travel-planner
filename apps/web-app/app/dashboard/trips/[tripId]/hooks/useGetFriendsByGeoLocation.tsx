'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  getFriendsByGeoLocation,
  GetFriendsByGeoLocationProps,
  GetFriendsByGeoLocationResponse,
} from '@/lib/actions/friends';

export type UseGetFriendsByGeoLocationOptions = Partial<
  UseQueryOptions<
    GetFriendsByGeoLocationResponse,
    Error,
    GetFriendsByGeoLocationResponse
  >
>;

export type UseGetFriendsByGeoLocationProps = {
  coordinates?: {
    lat: number;
    lng: number;
  };
} & UseGetFriendsByGeoLocationOptions;

const useGetFriendsByGeoLocation = ({
  coordinates,
  enabled = true,
  ...options
}: UseGetFriendsByGeoLocationProps) =>
  useQuery({
    enabled: !!coordinates && enabled,
    queryKey: ['getFriendsByGeoLocation', coordinates],
    queryFn: () => getFriendsByGeoLocation(coordinates!),
    ...options,
  });

export default useGetFriendsByGeoLocation;
