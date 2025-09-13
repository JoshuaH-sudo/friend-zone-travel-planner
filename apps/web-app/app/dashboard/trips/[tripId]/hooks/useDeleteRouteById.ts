'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import deleteRoute from '../actions/deleteRoute';

interface UseDeleteRouteByIdProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const useDeleteRouteById = ({ onSuccess, onError }: UseDeleteRouteByIdProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRoute,
    onSuccess: async (_, { tripId, routeId }) => {
      // Invalidate any relevant queries
      await queryClient.invalidateQueries({ queryKey: ['routes', routeId] });
      await queryClient.invalidateQueries({ queryKey: ['trips', tripId] });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error('Error deleting route:', error);
      
      if (onError) {
        onError(error as Error);
      }
    },
  });
};

export default useDeleteRouteById;
