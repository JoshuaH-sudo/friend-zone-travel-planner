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
import { DateRangeInput } from '@/components/ui/dateRangeInput';
import { DateRange } from 'react-day-picker';
import { differenceInDays, set } from 'date-fns';
import { Database } from '@/lib/supabase/database.types';
import { GetRouteByIdResponse } from '../../hooks/useGetRouteById';

interface DestinationFormProps {
  route: GetRouteByIdResponse;
  previousDestination?: Database['public']['Tables']['destinations']['Row'];
}

const DestinationForm = ({
  route,
  previousDestination,
}: DestinationFormProps) => {
  const { setValue, control, watch } = useFormContext();
  const address = watch('location');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    console.log('Previous destination:', previousDestination);
    if (previousDestination) {
      // Start date should be the end date of the last destination
      setValue('startDate', new Date(previousDestination.end_date));
    } else {
      console.log('Route start date:', route.date_from);
      // set from to be the route start date
      setValue('startDate', new Date(route.date_from!));
    }
  }, [previousDestination?.end_date, route.date_from]);

  const [debouncedValue] = useDebouncedValue(address, {
    wait: 1000,
  });
  const { suggestions } = useAddressAutocomplete(debouncedValue);
  const { data: coordinates, refetch } = useGetAddressCoordinates(
    debouncedValue,
    { enabled: false }
  );
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

  const startDateSelection = previousDestination
    ? new Date(previousDestination.end_date)
    : new Date(route.date_from!);

  const dateRange: DateRange = {
    from: startDate,
    to: endDate,
  };

  return (
    <div className='space-y-6 py-2'>
      <FormField
        control={control}
        name='location'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Autocomplete
                {...field}
                options={suggestions}
                placeholder='Enter your destination'
                emptyMessage='No results found'
                onInputChange={(value) => {
                  field.onChange(value);
                }}
                onSelect={(suggestion) => {
                  // Update the form with the selected address
                  const selectedAddress = suggestion.text.text;
                  field.onChange(selectedAddress);
                }}
                onClear={() => {
                  field.onChange('');
                }}
              />
            </FormControl>
            <FormDescription>Enter your destination</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className='grid grid-cols-1 gap-4'>
        <FormItem>
          <FormLabel>Dates</FormLabel>
          <FormControl>
            <DateRangeInput
              className='mb-2'
              dates={dateRange}
              onSelect={(dates) => {
                // Update start date when from is selected
                if (dates?.from) {
                  setValue('startDate', dates.from);
                }
                // Update end date when to is selected
                if (dates?.to) {
                  setValue('endDate', dates.to);
                }
              }}
              calendarProps={{
                disabled: {
                  before: startDateSelection,
                },
                startMonth: startDateSelection,
                mode: 'range',
              }}
            />
          </FormControl>
          <FormDescription>
            Select the start and end dates for your stay
          </FormDescription>
          <FormMessage />
        </FormItem>
      </div>

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
