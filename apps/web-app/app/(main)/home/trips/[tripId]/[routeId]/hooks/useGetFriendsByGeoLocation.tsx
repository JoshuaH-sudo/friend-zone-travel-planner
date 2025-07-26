'use client';

import { UseMutationOptions, useQuery } from '@tanstack/react-query';
import {} from '../../../../../../../lib/actions/destinations';
import {
  getFriendsByGeoLocation,
  GetFriendsByGeoLocationProps,
} from '../../../../../../../lib/actions/friends';

export type UseGetFriendsByGeoLocation = UseMutationOptions<
  GetFriendsByGeoLocationProps,
  Error,
  GetFriendsByGeoLocationProps
>;
const useGetFriendsByGeoLocation = (
  coordinates?: GetFriendsByGeoLocationProps
) =>
  useQuery({
    enabled: !!coordinates,
    queryKey: ['getFriendsByGeoLocation', coordinates],
    queryFn: () => getFriendsByGeoLocation(coordinates!),
  });

export default useGetFriendsByGeoLocation;
