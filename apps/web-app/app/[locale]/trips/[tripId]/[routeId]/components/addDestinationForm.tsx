'use client';

import { DatePickerWithRange } from '@/components/ui/datePickerWithRange';
import { Input } from '@/components/ui/input';
import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useAddDestinationToRoute from '@/lib/hooks/useAddDestinationToRoute';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Combobox } from '@/components/ui/combo-box';
import { AddDestinationToRouteProps } from '@/lib/actions/destinations';
import useGetFriendsByGeoLocation from '@/lib/hooks/useGetFriendsByGeoLocation';
import useGetAddressCoordinates from '@/lib/hooks/useGetAddressCoordinates';
import { useDebouncedValue } from '@tanstack/react-pacer';

export interface NewDestination {
  routeId: number;
  location: string;
  friendIds: number[];
  dateRange: {
    from: Date;
    to: Date;
  };
}

const schema = z.object({
  routeId: z.number().int().positive('Route ID must be a positive integer'),
  location: z.string().min(1, 'Location is required'),
  friendIds: z.array(z.number()),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
});

export interface AddDestinationFormProps {
  routeId: number;
}

const AddDestinationForm: FC<AddDestinationFormProps> = ({ routeId }) => {
  const queryClient = useQueryClient();

  const form = useForm<NewDestination>({
    defaultValues: {
      routeId,
      friendIds: [],
    },
    resolver: zodResolver(schema),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = form;

  const location = form.watch('location');
  const [debouncedValue] = useDebouncedValue(location, {
    wait: 1000,
  });
  const { data: coordinates, isError, error, refetch } = useGetAddressCoordinates(debouncedValue, { enabled: false });
  const { data: friends } = useGetFriendsByGeoLocation(
    coordinates?.geometry?.location
  );
  console.log('coordinates: ', coordinates);

  useEffect(() => {
    console.log('Refetching coordinates for:', debouncedValue);
    refetch();
  }, [debouncedValue]);

  const { mutateAsync: addDestinationToRoute } = useAddDestinationToRoute({
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({
        queryKey: ['destinations', routeId],
      });
    },
    onError: (error) => {
      console.error('Error adding destination:', error);
    },
  });

  const onSubmit = async (data: NewDestination) => {
    // Transform the form data to match the API expected format
    const transformedData: AddDestinationToRouteProps = {
      routeId: data.routeId,
      location: data.location,
      friendIds: data.friendIds,
      startDate: data.dateRange.from,
      endDate: data.dateRange.to,
    };

    await addDestinationToRoute(transformedData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex h-full flex-col gap-1'
      >
        <div>
          <p>Destination</p>
          <FormField
            control={control}
            name='location'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder='Berlin' {...field} />
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
        </div>

        <div>
          <FormField
            control={control}
            name='dateRange'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dates</FormLabel>
                <FormControl>
                  <DatePickerWithRange
                    dates={
                      field.value
                        ? { from: field.value.from, to: field.value.to }
                        : { from: undefined, to: undefined }
                    }
                    onSelect={field.onChange}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Select the start and end dates for your trip
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='h-1/3'>
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

        <button
          id='add-destination'
          className='w-full rounded-lg bg-green-500 p-2 text-white transition-colors duration-200 hover:bg-green-600 disabled:opacity-50'
          type='submit'
          disabled={!isValid}
        >
          Add
        </button>
      </form>
    </Form>
  );
};

export default AddDestinationForm;
