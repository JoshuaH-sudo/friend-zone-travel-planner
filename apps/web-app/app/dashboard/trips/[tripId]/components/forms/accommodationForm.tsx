'use client';

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DateRangeInput } from '@/components/ui/dateRangeInput';
import { DateRange } from 'react-day-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAddAccommodationToDestination from '../../hooks/useAddAccommodationToDestination';
import useEditAccommodation from '../../hooks/useEditAccommodation';
import { Destination } from '../tripOverviewClient';

// Accommodation form schema
const accommodationSchema = z.object({
  id: z.string().optional(),
  destinationId: z.string(),
  name: z.string().min(1, 'Name is required'),
  address: z.string().default(''),
  cost: z.number().min(0, 'Cost must be positive').default(0),
  currency: z.string().default('USD'),
  href: z.string().optional().nullable(),
  type: z
    .enum(['hotel', 'motel', 'hostel', 'friend', 'airbnb', 'other'])
    .default('hotel'),
  friendId: z.string().optional().nullable(),
  checkIn: z.date().nullable(),
  checkOut: z.date().nullable(),
});

export type AccommodationFormType = z.infer<typeof accommodationSchema>;

export interface AccommodationFormProps {
  destination: Destination;
  initialData?: Partial<AccommodationFormType>;
  onSuccess?: () => void;
}

const AccommodationForm: FC<AccommodationFormProps> = ({
  destination,
  initialData,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { id: destinationId, start_date, end_date } = destination;
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  const defaultValues: AccommodationFormType = {
    destinationId,
    name: '',
    address: '',
    cost: 0,
    currency: 'USD',
    href: null,
    type: 'hotel',
    friendId: null,
    checkIn: new Date(startDate),
    checkOut: new Date(endDate),
    ...initialData,
  };

  const form = useForm<AccommodationFormType>({
    resolver: zodResolver(accommodationSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { watch, handleSubmit } = form;

  const checkInDate = watch('checkIn');
  const checkOutDate = watch('checkOut');

  // Set up date range object for the picker
  const dateRange: DateRange = {
    from: checkInDate || startDate,
    to: checkOutDate || endDate,
  };

  // Mutation hooks
  const { mutateAsync: addAccommodation } = useAddAccommodationToDestination({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['destinations', destinationId],
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error adding accommodation:', error);
    },
  });

  const { mutateAsync: editAccommodationMutation } = useEditAccommodation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['destinations', destinationId],
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error updating accommodation:', error);
    },
  });

  const onSubmit = async (data: AccommodationFormType) => {
    try {
      if (data.id) {
        // Edit existing accommodation
        await editAccommodationMutation({
          ...data,
          id: data.id,
          href: data.href ?? null,
          friendId: data.friendId ?? null,
        });
      } else {
        // Create new accommodation
        const { id: _id, ...createData } = data;
        await addAccommodation({
          ...createData,
          href: createData.href ?? null,
          friendId: createData.friendId ?? null,
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex h-full flex-col gap-1 p-2'
      >
        <div className='space-y-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Hotel name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='address'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder='Address' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Check-in / Check-out Dates</FormLabel>
            <FormControl>
              <DateRangeInput
                className='mb-2'
                dates={dateRange}
                onSelect={(dates) => {
                  if (dates?.from) {
                    form.setValue('checkIn', dates.from);
                  }
                  if (dates?.to) {
                    form.setValue('checkOut', dates.to);
                  }
                }}
                calendarProps={{
                  disabled: {
                    before: startDate,
                  },
                  startMonth: startDate,
                  mode: 'range',
                }}
              />
            </FormControl>
            <FormDescription>
              Select the check-in and check-out dates for your accommodation
            </FormDescription>
            <FormMessage />
          </FormItem>

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='cost'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost per night</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min='0'
                      step='0.01'
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='currency'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select currency' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='USD'>USD ($)</SelectItem>
                      <SelectItem value='EUR'>EUR (€)</SelectItem>
                      <SelectItem value='GBP'>GBP (£)</SelectItem>
                      <SelectItem value='JPY'>JPY (¥)</SelectItem>
                      <SelectItem value='AUD'>AUD (A$)</SelectItem>
                      <SelectItem value='CAD'>CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='href'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder='https://example.com'
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Link to booking website or more information
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accommodation Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='hotel'>Hotel</SelectItem>
                    <SelectItem value='motel'>Motel</SelectItem>
                    <SelectItem value='hostel'>Hostel</SelectItem>
                    <SelectItem value='airbnb'>Airbnb</SelectItem>
                    <SelectItem value='friend'>Friend's Place</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type='submit' className='w-full'>
          {initialData?.id ? 'Update Accommodation' : 'Add Accommodation'}
        </Button>
      </form>
    </Form>
  );
};

export default AccommodationForm;
