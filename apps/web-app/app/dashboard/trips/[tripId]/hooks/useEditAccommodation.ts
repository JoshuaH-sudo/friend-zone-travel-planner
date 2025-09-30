'use client';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import {
  editAccommodation,
  EditAccommodationProps,
  AccommodationResponse,
} from '@/lib/actions/destinations';

export type UseEditAccommodation = UseMutationOptions<
  AccommodationResponse,
  Error,
  EditAccommodationProps
>;

const useEditAccommodation = (props?: UseEditAccommodation) =>
  useMutation({
    mutationFn: editAccommodation,
    ...props,
  });

export default useEditAccommodation;