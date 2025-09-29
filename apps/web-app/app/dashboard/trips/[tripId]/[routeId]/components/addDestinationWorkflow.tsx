'use client';

import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAddDestinationToRoute from '../hooks/useAddDestinationToRoute';
import useEditDestination from '../hooks/useEditDestination';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDays, differenceInDays } from 'date-fns';
import { Form } from '@/components/ui/form';
import { AddDestinationToRouteProps } from '@/lib/actions/destinations';
import DestinationForm from './forms/destinationForm';
import { TripByIdResponse } from '../../../actions/getTripById';
import { Button } from '@/components/ui/button';

// We'll just use the DestinationForm type, which comes from the zod schema

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
  accommodation: z
    .object({
      id: z.string().optional(),
      name: z.string().default(''),
      address: z.string().optional().default(''),
      cost: z.number().default(0),
      currency: z.string().default('USD'),
      href: z.string().optional().nullable().default(''),
      type: z
        .enum(['hotel', 'motel', 'hostel', 'friend', 'airbnb', 'other'])
        .default('hotel'),
      friendId: z.string().optional().nullable(),
      checkIn: z.date().nullable(),
      checkOut: z.date().nullable(),
    })
    .optional(),
  transport: z
    .object({
      id: z.string().optional(),
      name: z.string().default(''),
      address: z.string().optional().nullable().default(''),
      cost: z.number().default(0),
      currency: z.string().default('USD'),
      href: z.string().optional().nullable().default(''),
      type: z
        .enum(['airplane', 'bus', 'car', 'train', 'ferry', 'other'])
        .default('airplane'),
      departureAt: z.date().nullable().default(null),
      arrivalAt: z.date().nullable().default(null),
    })
    .optional(),
});

export type DestinationFormType = z.infer<typeof schema>;

export interface AddDestinationWorkflowProps {
  route: TripByIdResponse['routes'][0];
  destinationToEdit?: DestinationFormType;
}

const AddDestinationWorkflow: FC<AddDestinationWorkflowProps> = ({
  route,
  destinationToEdit,
}) => {
  const queryClient = useQueryClient();
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
      : route.date_from
        ? new Date(route.date_from)
        : new Date(),
    endDate: previousDestination
      ? // End date should default to the day after the start date
        addDays(new Date(previousDestination.end_date), 1)
      : route.date_from
        ? addDays(new Date(route.date_from), 1)
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

  useEffect(() => {
    if (destinationToEdit && destinationToEdit.id) {
      // If editing an existing destination, populate the form with its data
      const formData = { ...destinationToEdit };

      // Don't auto-create transport or accommodation if they don't exist
      // This allows destinations to not have transport/accommodation

      form.reset(formData);
    }
  }, [destinationToEdit]);

  const { handleSubmit, reset } = form;

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

    // Add accommodation data if provided and has required fields
    if (data.accommodation) {
      transformedData.accommodation = {
        ...data.accommodation,
        address: data.accommodation.address || null,
        href: data.accommodation.href || null,
        friendId: data.accommodation.friendId || null,
        checkIn: data.accommodation.checkIn,
        checkOut: data.accommodation.checkOut,
      };
    } else {
      // Explicitly set to undefined to ensure it's not included in the API call
      transformedData.accommodation = undefined;
    }

    // Add transport data if provided and has required fields
    if (data.transport) {
      transformedData.transport = {
        ...data.transport,
        address: data.transport.address || null,
        href: data.transport.href || null,
      };
    } else {
      // Explicitly set to undefined to ensure it's not included in the API call
      transformedData.transport = undefined;
    }

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

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex h-full flex-col gap-1 p-2'
      >
        <DestinationForm route={route} enableInitialLoad={!destinationToEdit} />
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

export default AddDestinationWorkflow;
