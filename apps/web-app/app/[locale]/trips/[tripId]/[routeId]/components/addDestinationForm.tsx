'use client';

import { DatePickerWithRange } from '@/components/ui/datePickerWithRange';
import { Input } from '@/components/ui/input';
import { Friend } from '@/lib/generated/prisma';
import { FC } from 'react';
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
import { addDestinationToRouteProps } from '@/lib/actions/destinations';

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
  friends: Friend[];
}

const AddDestinationForm: FC<AddDestinationFormProps> = ({
  routeId,
  friends,
}) => {
  const queryClient = useQueryClient();

  const form = useForm<NewDestination>({
    defaultValues: {
      location: '',
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
    const transformedData: addDestinationToRouteProps = {
      routeId: data.routeId,
      location: data.location,
      friendIds: data.friendIds,
      startDate: data.dateRange.from,
      endDate: data.dateRange.to,
    };

    await addDestinationToRoute(transformedData);
  };

  console.log('form values:', form.getValues());
  console.log('form errors:', form.formState.errors);

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
                    options={friends.map((friend) => ({
                      value: friend.id,
                      label: friend.name,
                    }))}
                    onChange={field.onChange}
                    value={field.value}
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
