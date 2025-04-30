import { getPlaceAutocomplete } from '@/lib/actions';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { useState } from 'react';

export type AddressSuggestion = {
  label: string;
  value: string;
  placeId: string;
};

export function useAddressAutocomplete(input: string) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);

  const { isLoading, error } = useQuery({
    queryKey: ['addressAutocomplete', input],
    queryFn: async () => {
      const response = await getPlaceAutocomplete(input);
      
      if (response.status === 'ERROR') {
        throw new Error(response.message);
      }

      const newSuggestions = (response.predictions ?? []).map(prediction => ({
        label: prediction.description,
        value: prediction.description,
        placeId: prediction.place_id,
      }));

      setSuggestions(newSuggestions);
      return newSuggestions;
    },
  });

  return {
    suggestions,
    isLoading,
    error,
  };
}