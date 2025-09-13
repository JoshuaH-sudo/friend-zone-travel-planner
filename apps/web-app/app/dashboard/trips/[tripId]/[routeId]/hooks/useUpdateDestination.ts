'use client';

import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { updateDestination, UpdateDestinationProps } from '@/lib/actions/destinations';

export interface UseUpdateDestinationOptions extends Omit<UseMutationOptions<any, Error, UpdateDestinationProps>, 'mutationFn'> {}

const useUpdateDestination = (options?: UseUpdateDestinationOptions) => {
  return useMutation({
    mutationFn: updateDestination,
    ...options,
  });
};

export default useUpdateDestination;
