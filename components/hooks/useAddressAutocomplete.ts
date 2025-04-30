import { getPlaceAutocomplete } from '@/lib/actions';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
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

type PlaceResponse = {
  placePrediction: PlacePrediction;
  kind: string;
};

export type AddressSuggestion = {
  label: string;  // Will use text.text from the API response
  value: string;  // Will use text.text from the API response
  placeId: string;
  mainText: string;
  secondaryText: string;
  types: string[];
};

export function useAddressAutocomplete(input: string) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const debouncedInput = useDebounce(input, 300);

  const { isLoading, error } = useQuery({
    enabled: !!debouncedInput,
    queryKey: ['addressAutocomplete', debouncedInput],
    queryFn: async () => {
      const response = await getPlaceAutocomplete(debouncedInput);
      
      if (response.status === 'ERROR') {
        throw new Error(response.message);
      }

      const newSuggestions: AddressSuggestion[] = response.suggestions.map((item: PlaceResponse) => ({
        label: item.placePrediction.text.text,
        value: item.placePrediction.text.text,
        placeId: item.placePrediction.placeId,
        mainText: item.placePrediction.structuredFormat.mainText.text,
        secondaryText: item.placePrediction.structuredFormat.secondaryText.text,
        types: item.placePrediction.types
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