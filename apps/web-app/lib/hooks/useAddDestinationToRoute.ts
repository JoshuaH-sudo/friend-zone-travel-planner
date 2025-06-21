'use client';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import {
  addDestinationToRoute,
  addDestinationToRouteProps,
} from '../actions/destinations';

export type UseAddDestinationToRoute = Omit<
  UseMutationOptions<
    addDestinationToRouteProps,
    Error,
    addDestinationToRouteProps
  >,
  'mutationFn'
>;
const useAddDestinationToRoute = (props?: UseAddDestinationToRoute) =>
  useMutation({
    mutationFn: addDestinationToRoute,
    ...props,
  });

export default useAddDestinationToRoute;
