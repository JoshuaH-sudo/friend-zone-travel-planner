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
import { DateRange } from 'react-day-picker';
import { addDestinationToRouteProps } from '@/lib/actions/destinations';

export interface NewDestination {
  routeId: number;
  location: string;
  friendIds: number[];
  startDate: Date;
  endDate: Date;
}

export interface AddDestinationFormProps {
  routeId: number;
  friends: Friend[];
}

const schema = z.object({
  routeId: z.number().int().positive('Route ID must be a positive integer'),
  location: z.string().min(1, 'Location is required'),
  friendIds: z.array(z.number()),
  startDate: z
    .date()
    .refine((date) => date === undefined || date instanceof Date, {
      message: 'Start date must be a valid date',
    }),
  endDate: z
    .date()
    .refine((date) => date === undefined || date instanceof Date, {
      message: 'End date must be a valid date',
    }),
});

const AddDestinationForm: FC<AddDestinationFormProps> = ({
  routeId,
  friends,
}) => {
  const queryClient = useQueryClient();

  const form = useForm<NewDestination, any, addDestinationToRouteProps>({
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
      console.log('Destination added successfully');
    },
    onError: (error) => {
      console.error('Error adding destination:', error);
    },
  });

  const onSubmit = async (data: NewDestination) => {
    await addDestinationToRoute(data);
  };

  const dates: DateRange = {
    to: form.watch('endDate') || undefined,
    from: form.watch('startDate') || undefined,
  };
  const onDateSelect = (selectedDates: DateRange | undefined) => {
    if (!selectedDates?.from || !selectedDates?.to) {
      form.resetField('startDate');
      form.resetField('endDate');
      return;
    }
    form.setValue('startDate', selectedDates.from);
    form.setValue('endDate', selectedDates.to);
  };

  const selectedFriends = form.watch('friendIds');
  console.log('Selected Friends:', selectedFriends);

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
          <p>Dates</p>
          <DatePickerWithRange dates={dates} onSelect={onDateSelect} />
        </div>

        <div className='h-1/3'>
          <p>Friends To See</p>
          <Combobox
            multiple
            options={friends.map((friend) => ({
              value: friend.id,
              label: friend.name,
            }))}
            onChange={(value) => {
              form.setValue('friendIds', value);
            }}
            value={selectedFriends}
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
