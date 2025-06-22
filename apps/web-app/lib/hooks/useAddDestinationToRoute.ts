'use client';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import {
  addDestinationToRoute,
  addDestinationToRouteProps,
} from '../actions/destinations';

export type UseAddDestinationToRoute = UseMutationOptions<
  addDestinationToRouteProps,
  Error,
  addDestinationToRouteProps
>;
const useAddDestinationToRoute = (props?: UseAddDestinationToRoute) =>
  useMutation({
    mutationFn: addDestinationToRoute,
    ...props,
  });

export default useAddDestinationToRoute;
