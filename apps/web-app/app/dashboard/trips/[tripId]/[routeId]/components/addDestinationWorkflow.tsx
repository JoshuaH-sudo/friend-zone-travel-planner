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

export interface NewDestination {
  routeId: string;
  location: string;
  friendIds: string[];
  startDate: Date;
  endDate: Date;
  days?: number;
  latitude: number;
  longitude: number;
  stayingWithFriend: boolean;
  selectedFriendId?: string;
  accommodation?: {
    name: string;
    address: string;
    cost: number;
    currency: string;
    href?: string;
    type: 'hotel' | 'motel' | 'hostel' | 'friend' | 'airbnb' | 'other';
    friendId?: string;
  };
  transport?: {
    name: string;
    address: string;
    cost: number;
    currency: string;
    href?: string;
    type: 'airplane' | 'bus' | 'car' | 'train' | 'ferry' | 'other';
    departureAt?: Date;
    arrivalAt?: Date;
    duration?: number;
  };
}

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
      name: z.string(),
      address: z.string(),
      cost: z.number(),
      currency: z.string(),
      href: z.string().optional(),
      type: z.enum(['hotel', 'motel', 'hostel', 'friend', 'airbnb', 'other']),
      friendId: z.string().optional(),
    })
    .optional(),
  transport: z
    .object({
      name: z.string(),
      address: z.string(),
      cost: z.number(),
      currency: z.string(),
      href: z.string().optional(),
      type: z.enum(['airplane', 'bus', 'car', 'train', 'ferry', 'other']),
      departureAt: z.date().optional(),
      arrivalAt: z.date().optional(),
      duration: z.number().optional(),
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
      ? new Date(new Date(previousDestination.end_date).getTime() + 24 * 60 * 60 * 1000) // Add one day
      : route.date_from
        ? new Date(new Date(route.date_from).getTime() + 24 * 60 * 60 * 1000) // Add one day
        : new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Add one day
  };

  const form = useForm<NewDestination>({
    defaultValues: {
      ...defaultNewDestination,
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (destinationToEdit && destinationToEdit.id) {
      // If editing an existing destination, populate the form with its data
      form.reset({
        ...destinationToEdit,
      });
    }
  }, [destinationToEdit]);

  const { control, handleSubmit, reset, watch, setValue, formState } = form;
  const { isValid, errors, validatingFields } = formState;
  console.log('form errors', errors, validatingFields);

  const location = watch('location');
  const startDate = watch('startDate');
  const endDate = watch('endDate');
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

  const onSubmit = async (data: NewDestination) => {
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

    // Add accommodation data if selected
    if (data.accommodation) {
      transformedData.accommodation = data.accommodation;
    }

    // Add transport data if selected
    if (data.transport) {
      transformedData.transport = data.transport;
    }

    if (destinationToEdit && destinationToEdit.id) {
      // We're editing an existing destination
      await editDestination({
        ...transformedData,
        id: destinationToEdit.id,
      });
    } else {
      // We're creating a new destination
      await addDestinationToRoute(transformedData);
    }
  };

  let tabs = [
    { value: 'destination', label: 'Details' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'transport', label: 'Transport' },
  ];

  // Don't need transport and stuff when it is the starting point.
  const currentTabIndex = tabs.findIndex((tab) => tab.value === activeTab);
  const isStartDestination = !previousDestination;
  const showBackButton = currentTabIndex > 0;
  const showNextButton =
    currentTabIndex < tabs.length - 1 && !isStartDestination;

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex h-full flex-col gap-1'
      >
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
              {destinationToEdit && destinationToEdit.id 
                ? 'Edit Details' 
                : isStartDestination 
                  ? 'Starting Point' 
                  : 'Details'}
            </TabsTrigger>
            {previousDestination && (
              <TabsTrigger
                value='accommodation'
                disabled={!location || !startDate || !endDate}
              >
                {destinationToEdit && destinationToEdit.id ? 'Edit Accommodation' : 'Accommodation'}
              </TabsTrigger>
            )}
            {previousDestination && (
              <TabsTrigger
                value='transport'
                disabled={!location || !startDate || !endDate}
              >
                {destinationToEdit && destinationToEdit.id ? 'Edit Transport' : 'Transport'}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value='destination' className='mt-2 space-y-4'>
            <DestinationForm
              route={route}
              previousDestination={previousDestination}
              disabledInitialLoad={!destinationToEdit}
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

        <div className='mt-4 flex justify-between'>
          <Button
            type='button'
            className={cn(
              'rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300',
              { invisible: !showBackButton }
            )}
            onClick={() => setActiveTab(tabs[currentTabIndex - 1]?.value)}
          >
            Back
          </Button>
          
          {destinationToEdit && destinationToEdit.id && (
            <Button
              type='button'
              className='rounded-md bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400'
              onClick={() => {
                reset(defaultNewDestination);
                setActiveTab('destination');
                if (onEditComplete) {
                  onEditComplete();
                }
              }}
            >
              Cancel Edit
            </Button>
          )}

          <Button
            type='submit'
            className='ml-auto rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600'
            hidden={!isValid}
          >
            {destinationToEdit && destinationToEdit.id ? 'Update' : 'Submit'}
          </Button>

          <Button
            type='button'
            className={cn(
              'ml-auto rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600',
              { invisible: !showNextButton }
            )}
            onClick={() => {
              setActiveTab(tabs[currentTabIndex + 1]?.value);
            }}
          >
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddDestinationWorkflow;
