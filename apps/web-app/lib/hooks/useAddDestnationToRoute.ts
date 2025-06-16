'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addDestinationToRoute } from '../actions/destinations';

const useAddDestinationToRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addDestinationToRoute,
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['destinations', variables.routeId],
      });
    },
  });
};

export default useAddDestinationToRoute;
