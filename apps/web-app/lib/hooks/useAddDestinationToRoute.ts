'use client';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import {
  addDestinationToRoute,
  AddDestinationToRouteProps,
  DestinationResponse,
} from '../actions/destinations';

export type UseAddDestinationToRoute = UseMutationOptions<
  DestinationResponse,
  Error,
  AddDestinationToRouteProps
>;
const useAddDestinationToRoute = (props?: UseAddDestinationToRoute) =>
  useMutation({
    mutationFn: addDestinationToRoute,
    ...props,
  });

export default useAddDestinationToRoute;
