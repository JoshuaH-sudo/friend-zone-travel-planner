'use client';

import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAddDestinationToRoute from '../hooks/useAddDestinationToRoute';
import useEditDestination from '../hooks/useEditDestination';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { differenceInDays } from 'date-fns';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from '@/components/ui/form';
import { AddDestinationToRouteProps } from '@/lib/actions/destinations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import FriendAccommodationSelector from './friendAccommodationSelector';
import AccommodationForm from './accommodationForm';
import ManualTransportForm from './transportForm';
import { Button } from '@/components/ui/button';
import DestinationForm from './destinationForm';
import { cn } from '@/lib/utils';
import { GetRouteByIdResponse } from '../../hooks/useGetRouteById';
import { FullDestination } from '@/lib/hooks/useGetDestinationsByRouteId';

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
      name: z.string().default(''),
      address: z.string().optional().default(''),
      cost: z.number().default(0),
      currency: z.string().default('USD'),
      href: z.string().optional().nullable().default(''),
      type: z
        .enum(['hotel', 'motel', 'hostel', 'friend', 'airbnb', 'other'])
        .default('hotel'),
      friendId: z.string().optional().nullable(),
      check_in: z.date().optional(),
      check_out: z.date().optional(),
    })
    .optional(),
  transport: z
    .object({
      name: z.string().default(''),
      address: z.string().optional().nullable().default(''),
      cost: z.number().default(0),
      currency: z.string().default('USD'),
      href: z.string().optional().nullable().default(''),
      type: z
        .enum(['airplane', 'bus', 'car', 'train', 'ferry', 'other'])
        .default('airplane'),
      departureAt: z
        .date()
        .optional()
        .default(() => new Date()),
      arrivalAt: z
        .date()
        .optional()
        .default(() => new Date()),
    })
    .optional(),
});

export type DestinationForm = z.infer<typeof schema>;

export interface AddDestinationWorkflowProps {
  route: GetRouteByIdResponse;
  previousDestination?: Omit<FullDestination, 'routes'>;
  destinationToEdit?: DestinationForm;
  onEditComplete: () => void;
}

const AddDestinationWorkflow: FC<AddDestinationWorkflowProps> = ({
  route,
  previousDestination,
  destinationToEdit,
  onEditComplete,
}) => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>('destination');
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
      ? new Date(
          new Date(previousDestination.end_date).getTime() + 24 * 60 * 60 * 1000
        ) // Add one day
      : route.date_from
        ? new Date(new Date(route.date_from).getTime() + 24 * 60 * 60 * 1000) // Add one day
        : new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Add one day
    // No default transport - it's optional
  };

  const form = useForm<DestinationForm>({
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

      // Reset to the first tab when only defining the starting point
      if (destinationToEdit.order === 1) {
        setActiveTab('destination');
      }
    }
  }, [destinationToEdit]);

  const { control, handleSubmit, reset, watch, setValue, formState } = form;
  const { isValid, isDirty } = formState;

  const stayingWithFriend = watch('stayingWithFriend');
  const selectedFriendId = watch('selectedFriendId');
  const latitude = watch('latitude');
  const longitude = watch('longitude');

  // Handle friend selection for accommodation
  const handleFriendSelect = (friendId: string) => {
    setValue('selectedFriendId', friendId);
    setValue('accommodation', undefined);
  };

  const { mutateAsync: addDestinationToRoute } = useAddDestinationToRoute({
    onSuccess: async () => {
      reset();
      setActiveTab('destination');
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
      setActiveTab('destination');
      await queryClient.invalidateQueries({
        queryKey: ['destinations', route.id],
      });
      await queryClient.invalidateQueries({ queryKey: ['routes', route.id] });

      // Call the onEditComplete callback if provided to reset the editing state
      if (onEditComplete) {
        onEditComplete();
      }
    },
    onError: (error) => {
      console.error('Error editing destination:', error);
    },
  });

  const onSubmit = async (data: DestinationForm) => {
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
        check_in: data.accommodation.check_in,
        check_out: data.accommodation.check_out,
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
      setActiveTab('destination');
      if (onEditComplete) {
        onEditComplete();
      }
    } else {
      // We're creating a new destination
      await addDestinationToRoute(transformedData);
    }
  };

  // Don't need transport and stuff when it is the starting point.
  const isStartDestination = !previousDestination;

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex h-full flex-col gap-1 p-2'
      >
        <div className='mb-4 flex items-end justify-between'>
          <h6 className='text-lg font-medium'>
            {destinationToEdit
              ? 'Edit Destination'
              : 'Add New Destination'}
          </h6>
        <div className='flex gap-2'>
          <Button
            type='submit'
            className='rounded-md bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400'
            hidden={!destinationToEdit}
          >
            Cancel Edit
          </Button>

          <Button
            type='submit'
            className='rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50'
            disabled={!isValid && isDirty}
          >
            {destinationToEdit && destinationToEdit.id ? 'Update' : 'Submit'}
          </Button>
        </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='h-full w-full'
        >
          <TabsList
            className={cn(
              'grid w-full',
              previousDestination ? 'grid-cols-3' : 'grid-cols-1'
            )}
          >
            <TabsTrigger value='destination'>
              {isStartDestination ? 'Starting Point' : 'Details'}
            </TabsTrigger>
            {previousDestination && (
              <TabsTrigger value='accommodation'>Accommodation</TabsTrigger>
            )}
            {previousDestination && (
              <TabsTrigger value='transport'>Transport</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value='destination' className='mt-2 space-y-4'>
            <DestinationForm
              route={route}
              previousDestination={previousDestination}
              enableInitialLoad={!destinationToEdit}
            />
          </TabsContent>

          <TabsContent value='accommodation' className='mt-2 space-y-4'>
            <FormField
              control={control}
              name='stayingWithFriend'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                  <div className='space-y-0.5'>
                    <FormLabel>Staying with a friend?</FormLabel>
                    <FormDescription>
                      Toggle this if you'll be staying at a friend's place
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {stayingWithFriend ? (
              <FriendAccommodationSelector
                selectedFriendId={selectedFriendId || null}
                coordinates={{ lat: latitude, lng: longitude }}
                onSelectFriend={handleFriendSelect}
              />
            ) : (
              <AccommodationForm />
            )}
          </TabsContent>

          <TabsContent value='transport' className='mt-2 space-y-4'>
            <ManualTransportForm />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};

export default AddDestinationWorkflow;
