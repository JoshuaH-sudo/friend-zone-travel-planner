'use client';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import {
  editTransport,
  EditTransportProps,
  TransportResponse,
} from '@/lib/actions/destinations';

export type UseEditTransport = UseMutationOptions<
  TransportResponse,
  Error,
  EditTransportProps
>;

const useEditTransport = (props?: UseEditTransport) =>
  useMutation({
    mutationFn: editTransport,
    ...props,
  });

export default useEditTransport;