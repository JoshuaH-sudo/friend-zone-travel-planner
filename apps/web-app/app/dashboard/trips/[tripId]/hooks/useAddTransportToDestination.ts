'use client';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import {
  addTransportToDestination,
  AddTransportToDestinationProps,
  TransportResponse,
} from '@/lib/actions/destinations';

export type UseAddTransportToDestination = UseMutationOptions<
  TransportResponse,
  Error,
  AddTransportToDestinationProps
>;

const useAddTransportToDestination = (props?: UseAddTransportToDestination) =>
  useMutation({
    mutationFn: addTransportToDestination,
    ...props,
  });

export default useAddTransportToDestination;