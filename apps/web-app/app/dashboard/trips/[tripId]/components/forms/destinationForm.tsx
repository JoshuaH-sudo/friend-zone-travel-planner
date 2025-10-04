'use client';

import { Autocomplete } from '@/components/ui/autocomplete';
import { Combobox } from '@/components/ui/combo-box';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Form,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useAddressAutocomplete } from '@/hooks/useAddressAutocomplete';
import { FC, useEffect, useState } from 'react';
import useGetAddressCoordinates from '../../hooks/useGetAddressCoordinates';
import useGetFriendsByGeoLocation from '../../hooks/useGetFriendsByGeoLocation';
import useAddDestinationToRoute from '../../hooks/useAddDestinationToRoute';
import useEditDestination from '../../hooks/useEditDestination';
import { useDebouncedValue } from '@tanstack/react-pacer';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { DateRangeInput } from '@/components/ui/dateRangeInput';
import { DateRange } from 'react-day-picker';
import { TripByIdResponse } from '@/app/dashboard/trips/actions/getTripById';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDays, differenceInDays } from 'date-fns';
import { AddDestinationToRouteProps } from '@/lib/actions/destinations';

// Simplified Zod schema for destination form only
const schema = z.object({
  id: z.string().optional(),
  routeId: z.string(),
  order: z.number().optional(),
  location: z.string().min(1, 'Location is required'),
  friendIds: z.array(z.string()),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  days: z.number().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  stayingWithFriend: z.boolean().default(false),
  selectedFriendId: z.string().optional(),
});

export type DestinationFormType = z.infer<typeof schema>;

export interface DestinationFormProps {
  route: TripByIdResponse['routes'][0];
  destinationToEdit?: TripByIdResponse['routes'][0]['destinations'][0] | null;
}

const DestinationForm: FC<DestinationFormProps> = ({
  route,
  destinationToEdit,
}) => {
  const queryClient = useQueryClient();
  const [enableApiCalls, setEnableApiCalls] = useState(!destinationToEdit);
  const previousDestination = route.destinations
    .sort((a, b) => a.order - b.order)
    .slice(-1)[0];

  const defaultNewDestination = {
    routeId: route.id,
    location: '',
    friendIds: [],
    stayingWithFriend: false,
    latitude: 0,
    longitude: 0,
    startDate: previousDestination
      ? new Date(previousDestination.end_date)
      : new Date(),
    endDate: previousDestination
      ? // End date should default to the day after the start date
        addDays(new Date(previousDestination.end_date), 1)
      : addDays(new Date(), 1),
  };

  const form = useForm<DestinationFormType>({
    defaultValues: {
      ...defaultNewDestination,
    },
    resolver: zodResolver(schema),
    mode: 'onChange',
    criteriaMode: 'all',
    // This makes the form a bit more lenient - we'll manually validate before submission
    reValidateMode: 'onChange',
  });

  const { setValue, control, watch, handleSubmit, reset } = form;
  const address = watch('location');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    if (destinationToEdit && destinationToEdit.id) {
      // If editing an existing destination, populate the form with its data
      const formData = { ...destinationToEdit };
      form.reset(formData);
    }
  }, [destinationToEdit, form]);

  useEffect(() => {
    if (previousDestination) {
      // Prevent or enable initial API calls when destination changes
      setEnableApiCalls(!destinationToEdit);
      // Start date should be the end date of the last destination
      setValue('startDate', new Date(previousDestination.end_date));
    } else {
      // set from to to now if no previous destination.
      setValue('startDate', new Date());
    }
  }, [previousDestination?.end_date, destinationToEdit, setValue]);

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
      setValue('latitude', 0);
      setValue('longitude', 0);
    }
  }, [debouncedAddressValue, address, setValue]);

  useEffect(() => {
    if (coordinates) {
      setValue('latitude', coordinates.geometry.location.lat);
      setValue('longitude', coordinates.geometry.location.lng);
    }
  }, [coordinates, setValue]);

  // Mutation hooks for API calls
  const { mutateAsync: addDestinationToRoute } = useAddDestinationToRoute({
    onSuccess: async () => {
      reset();
      await queryClient.invalidateQueries({
        queryKey: ['destinations', route.id],
      });
      await queryClient.invalidateQueries({ queryKey: ['routes', route.id] });
    },
    onError: (error) => {
      console.error('Error adding destination:', error);
    },
  });

  const { mutateAsync: editDestination } = useEditDestination({
    onSuccess: async () => {
      reset(defaultNewDestination);
      await queryClient.invalidateQueries({
        queryKey: ['destinations', route.id],
      });
      await queryClient.invalidateQueries({ queryKey: ['routes', route.id] });
    },
    onError: (error) => {
      console.error('Error editing destination:', error);
    },
  });

  // Submit handler
  const onSubmit = async (data: DestinationFormType) => {
    // Calculate days based on startDate and endDate
    const days = differenceInDays(data.endDate, data.startDate) + 1;

    // Transform the form data to match the API expected format
    const transformedData: AddDestinationToRouteProps = {
      routeId: data.routeId,
      location: data.location,
      friendIds: data.friendIds,
      days: days,
      latitude: data.latitude,
      longitude: data.longitude,
      startDate: data.startDate,
      endDate: data.endDate,
    };

    // Accommodation and transport are now handled by separate forms

    if (destinationToEdit && destinationToEdit.id) {
      // We're editing an existing destination
      await editDestination({
        ...transformedData,
        id: destinationToEdit.id,
      });
      reset(defaultNewDestination);
    } else {
      // We're creating a new destination
      await addDestinationToRoute(transformedData);
    }
  };

  const startDateSelection = previousDestination
    ? new Date(previousDestination.end_date)
    : new Date();

  const dateRange: DateRange = {
    from: startDate,
    to: endDate,
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex h-full flex-col gap-1 p-2'
      >
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
                <FormDescription>
                  Which friends are you going see
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type='submit'
          className='mt-2 w-full'
          disabled={!form.formState.isValid}
        >
          {destinationToEdit && destinationToEdit.id
            ? 'Save Changes'
            : 'Add Destination'}
        </Button>
      </form>
    </Form>
  );
};

export default DestinationForm;
