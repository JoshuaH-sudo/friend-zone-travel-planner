import { Autocomplete } from '@/components/ui/autocomplete';
import { Combobox } from '@/components/ui/combo-box';
import { DaysSlider } from '@/components/ui/daysSlider';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { useAddressAutocomplete } from '@/hooks/useAddressAutocomplete';
import { useState, useEffect } from 'react';
import useGetAddressCoordinates from '../hooks/useGetAddressCoordinates';
import useGetFriendsByGeoLocation from '../hooks/useGetFriendsByGeoLocation';
import { useDebouncedValue } from '@tanstack/react-pacer';
import { useFormContext } from 'react-hook-form';

const DestinationForm = () => {
  const [addressSearchInput, setAddressSearchInput] = useState<string>('');
  const { suggestions } = useAddressAutocomplete(addressSearchInput);

  const { watch, setValue, control } = useFormContext();
  const location = watch('location');

  const [debouncedValue] = useDebouncedValue(location, {
    wait: 1000,
  });

  const {
    data: coordinates,
    isError,
    error,
    refetch,
  } = useGetAddressCoordinates(debouncedValue, { enabled: false });
  const { data: friends } = useGetFriendsByGeoLocation(
    coordinates?.geometry?.location
  );

  useEffect(() => {
    if (debouncedValue && debouncedValue.trim().length > 0) {
      console.log('Refetching coordinates for:', debouncedValue);
      refetch();
    }
  }, [debouncedValue, refetch]);

  useEffect(() => {
    if (coordinates) {
      setValue('latitude', coordinates.geometry.location.lat);
      setValue('longitude', coordinates.geometry.location.lng);
    }
  }, [coordinates, setValue]);
  return (
    <div>
      <FormField
        control={control}
        name='location'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Autocomplete
                {...field}
                value={addressSearchInput}
                options={suggestions}
                placeholder='Enter your destination'
                emptyMessage='No results found'
                onInputChange={(value) => {
                  setAddressSearchInput(value);
                }}
                onSelect={(suggestion) => {
                  console.log('Selected suggestion:', suggestion);
                  // Update the form with the selected address
                  const selectedAddress = suggestion.text.text;
                  setAddressSearchInput(selectedAddress);
                  setValue('location', selectedAddress);
                  field.onChange(selectedAddress);
                }}
                onClear={() => {
                  setAddressSearchInput('');
                  setValue('location', '');
                  field.onChange('');
                }}
              />
            </FormControl>
            <FormDescription>Enter your destination</FormDescription>
            <FormMessage />
            <FormMessage>
              {isError && (
                <span className='text-red-500'>
                  {error?.message || 'Failed to fetch coordinates'}
                </span>
              )}
            </FormMessage>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name='days'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duration</FormLabel>
            <FormControl>
              <DaysSlider
                value={field.value || 1}
                onChange={field.onChange}
                min={1}
                max={30}
                step={1}
                label='Duration'
              />
            </FormControl>
            <FormDescription>
              Select how many days you'll stay at this destination
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name='friendIds'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Friends To See</FormLabel>
            <FormControl>
              <Combobox
                multiple
                options={
                  friends?.map((friend) => ({
                    value: friend.id,
                    label: friend.name,
                  })) || []
                }
                {...field}
              />
            </FormControl>
            <FormDescription>Which friends are you going see</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default DestinationForm;
