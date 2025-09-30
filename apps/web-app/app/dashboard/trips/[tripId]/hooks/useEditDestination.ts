'use client';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import {
  editDestination,
  EditDestinationProps,
  AddDestinationToRouteResponse,
} from '@/lib/actions/destinations';

export type UseEditDestination = UseMutationOptions<
  AddDestinationToRouteResponse,
  Error,
  EditDestinationProps
>;

const useEditDestination = (props?: UseEditDestination) =>
  useMutation({
    mutationFn: editDestination,
    ...props,
  });

export default useEditDestination;
