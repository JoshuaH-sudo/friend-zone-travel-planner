'use client';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import {
  addDestinationToRoute,
  AddDestinationToRouteProps,
  AddDestinationToRouteResponse,
} from '../../../../../../../lib/actions/destinations';

export type UseAddDestinationToRoute = UseMutationOptions<
  AddDestinationToRouteResponse,
  Error,
  AddDestinationToRouteProps
>;
const useAddDestinationToRoute = (props?: UseAddDestinationToRoute) =>
  useMutation({
    mutationFn: addDestinationToRoute,
    ...props,
  });

export default useAddDestinationToRoute;
