import { Autocomplete } from '@/components/ui/autocomplete';
import { Combobox } from '@/components/ui/combo-box';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { useAddressAutocomplete } from '@/hooks/useAddressAutocomplete';
import { useEffect, useState } from 'react';
import useGetAddressCoordinates from '../../hooks/useGetAddressCoordinates';
import useGetFriendsByGeoLocation from '../../hooks/useGetFriendsByGeoLocation';
import { useDebouncedValue } from '@tanstack/react-pacer';
import { useFormContext } from 'react-hook-form';
import { DateRangeInput } from '@/components/ui/dateRangeInput';
import { DateRange } from 'react-day-picker';
import { GetRouteByIdResponse } from '../../../hooks/useGetRouteById';
import { FullDestination } from '@/lib/hooks/useGetDestinationsByRouteId';

interface DestinationFormProps {
  route: GetRouteByIdResponse;
  previousDestination?: Omit<FullDestination, 'routes'>;
  enableInitialLoad?: boolean;
}

const DestinationForm = ({
  route,
  previousDestination,
  enableInitialLoad = true,
}: DestinationFormProps) => {
  const [enableApiCalls, setEnableApiCalls] = useState(enableInitialLoad);
  const { setValue, control, watch } = useFormContext();
  const address = watch('location');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    setEnableApiCalls(enableInitialLoad);
  }, [enableInitialLoad]);


  useEffect(() => {
    if (previousDestination) {
      // Prevent or enable initial API calls when destination changes
      setEnableApiCalls(enableInitialLoad)
      // Start date should be the end date of the last destination
      setValue('startDate', new Date(previousDestination.end_date));
    } else {
      // set from to be the route start date
      setValue('startDate', new Date(route.date_from!));
    }
  }, [previousDestination?.end_date, route.date_from]);

  // Get address suggestions as the user types
  const [debouncedAutocompleteInput] = useDebouncedValue<string>(address, {
    wait: 300,
  });
  const { suggestions } = useAddressAutocomplete(debouncedAutocompleteInput, {
    enabled: debouncedAutocompleteInput.trim().length > 0 && enableApiCalls,
  });

  // Get coordinates when an address is selected
  const [debouncedAddressValue] = useDebouncedValue<string>(address, {
    wait: 1000,
  });
  const { data: coordinates } = useGetAddressCoordinates(
    debouncedAddressValue,
    { enabled: debouncedAddressValue.trim().length > 0 && enableApiCalls }
  );

  // Get friends near the selected coordinates
  const { data: friends } = useGetFriendsByGeoLocation({
    coordinates: coordinates?.geometry?.location,
    enabled: !!coordinates && enableApiCalls,
  });

  useEffect(() => {
    // reset lat/lng if address changes
    if (
      debouncedAddressValue &&
      debouncedAddressValue.trim().length > 0 &&
      debouncedAddressValue !== address
    ) {
      setValue('latitude', null);
      setValue('longitude', null);
    }
  }, [debouncedAddressValue, address]);

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
                  setEnableApiCalls(true);
                }}
                onSelect={(suggestion) => {
                  // Update the form with the selected address
                  const selectedAddress = suggestion.text.text;
                  field.onChange(selectedAddress);
                  setEnableApiCalls(true);
                }}
                onClear={() => {
                  field.onChange('');
                  setEnableApiCalls(true);
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
