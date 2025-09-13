import { getPlaceAutocomplete } from '@/lib/actions/google';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useState } from 'react';

type TextMatch = {
  startOffset: number;
  endOffset: number;
};

type FormattedText = {
  matches: TextMatch[];
  text: string;
};

type StructuredFormat = {
  mainText: FormattedText;
  secondaryText: FormattedText;
};

type PlacePrediction = {
  types: string[];
  place: string;
  placeId: string;
  text: FormattedText;
  structuredFormat: StructuredFormat;
  distanceMeters: number;
};

export type AddressSuggestion = {
  label: string; // Will use text.text from the API response
  value: PlacePrediction; // Will use text.text from the API response
};
type Options = Omit<
  UseQueryOptions<AddressSuggestion[], Error>,
  'queryKey' | 'queryFn'
>;
export function useAddressAutocomplete(input: string, options?: Options) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);

  const { isLoading, error } = useQuery({
    enabled: !!input && options?.enabled,
    queryKey: ['addressAutocomplete', input],
    queryFn: async () => {
      const response = await getPlaceAutocomplete(input);

      if (response.status === 'ERROR') {
        throw new Error(response.message);
      }

      if (!response.suggestions) {
        return [];
      }

      try {
        const newSuggestions: AddressSuggestion[] = response.suggestions
          .map((item) => {
            return {
              label: item.placePrediction?.text?.text,
              value: item.placePrediction,
            };
          })
          // Filter out undefined labels or values
          .filter((s): s is AddressSuggestion => !!s.label && !!s.value);

        setSuggestions(newSuggestions);
        return newSuggestions;
      } catch (error) {
        console.error('Error processing response:', error);
        throw new Error('Failed to process address suggestions');
      }
    },
    ...options,
  });

  return {
    suggestions,
    isLoading,
    error,
  };
}
