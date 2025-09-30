'use client';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import {
  addAccommodationToDestination,
  AddAccommodationToDestinationProps,
  AccommodationResponse,
} from '@/lib/actions/destinations';

export type UseAddAccommodationToDestination = UseMutationOptions<
  AccommodationResponse,
  Error,
  AddAccommodationToDestinationProps
>;

const useAddAccommodationToDestination = (props?: UseAddAccommodationToDestination) =>
  useMutation({
    mutationFn: addAccommodationToDestination,
    ...props,
  });

export default useAddAccommodationToDestination;