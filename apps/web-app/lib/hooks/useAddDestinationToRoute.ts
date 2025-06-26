'use client';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import {
  addDestinationToRoute,
  addDestinationToRouteProps,
  DestinationResponse,
} from '../actions/destinations';

export type UseAddDestinationToRoute = UseMutationOptions<
  DestinationResponse,
  Error,
  addDestinationToRouteProps
>;
const useAddDestinationToRoute = (props?: UseAddDestinationToRoute) =>
  useMutation({
    mutationFn: addDestinationToRoute,
    ...props,
  });

export default useAddDestinationToRoute;
