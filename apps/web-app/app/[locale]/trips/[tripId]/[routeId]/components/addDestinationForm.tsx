'use client';

import { DatePickerWithRange } from '@/components/ui/datePickerWithRange';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Destination, Friend } from '@/lib/generated/prisma';
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

export type NewDestination = Omit<Destination, 'id'>;

export interface AddDestinationFormProps {
  routeId: number;
  friends: Friend[];
  currentOrder?: number;
}

const schema = z.object({
  location: z.string().min(1, 'Location is required'),
  order: z.number().int().positive('Order must be a positive integer'),
  routeId: z.number().int().positive('Route ID must be a positive integer'),
});

const AddDestinationForm: FC<AddDestinationFormProps> = ({
  routeId,
  friends,
  currentOrder = 0,
}) => {
  const queryClient = useQueryClient();

  const form = useForm<NewDestination, any, NewDestination>({
    defaultValues: {
      location: '',
      order: currentOrder + 1,
      routeId,
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
          <DatePickerWithRange />
        </div>

        <div className='h-1/3'>
          <p>Friends To See</p>
          <ScrollArea>
            {friends.map((friend) => (
              <div
                key={friend.id}
                className='my-2 cursor-pointer rounded-lg bg-gray-200 p-2 text-black transition-colors duration-200 hover:bg-red-400'
              >
                {friend.name}
              </div>
            ))}
          </ScrollArea>
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
