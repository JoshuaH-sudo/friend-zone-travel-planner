'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import updateTrip from '../actions/updateTrip';

interface UseUpdateTripProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const useUpdateTrip = ({ onSuccess, onError }: UseUpdateTripProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTrip,
    onSuccess: async (_, variables) => {
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] });
      await queryClient.invalidateQueries({ queryKey: ['trips'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error('Error updating trip:', error);
      
      if (onError) {
        onError(error as Error);
      }
    },
  });
};

export default useUpdateTrip;
