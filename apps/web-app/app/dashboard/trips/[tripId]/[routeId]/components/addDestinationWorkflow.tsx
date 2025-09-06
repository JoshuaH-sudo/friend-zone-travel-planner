'use client';

import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAddDestinationToRoute from '../hooks/useAddDestinationToRoute';
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
import { Database } from '@/lib/supabase/database.types';
import { GetRouteByIdResponse } from '../../hooks/useGetRouteById';

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
  routeId: z.string(),
  location: z.string().min(1, 'Location is required'),
  friendIds: z.array(z.string()),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
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

export type NewDestinationForm = z.infer<typeof schema>;

export interface AddDestinationWorkflowProps {
  route: GetRouteByIdResponse;
  previousDestination?: Database['public']['Tables']['destinations']['Row'];
}

const AddDestinationWorkflow: FC<AddDestinationWorkflowProps> = ({
  route,
  previousDestination,
}) => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>('destination');

  const form = useForm<NewDestination>({
    defaultValues: {
      routeId: route.id,
      friendIds: [],
      stayingWithFriend: false,
      startDate: previousDestination 
        ? new Date(previousDestination.end_date) 
        : route.date_from ? new Date(route.date_from) : new Date(),
      endDate: previousDestination 
        ? new Date(previousDestination.end_date) 
        : route.date_from ? new Date(route.date_from) : new Date(),
    },
    resolver: zodResolver(schema),
  });

  const { control, handleSubmit, reset, watch, setValue, formState } = form;
  const { isValid } = formState;

  const location = watch('location');
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const stayingWithFriend = watch('stayingWithFriend');
  const selectedFriendId = watch('selectedFriendId');
  const selectedAccommodation = watch('accommodation');
  const latitude = watch('latitude');
  const longitude = watch('longitude');

  // Handle staying with friend toggle
  useEffect(() => {
    if (stayingWithFriend) {
      // Clear any selected accommodation when switching to staying with friend
      setValue('accommodation', undefined);
    } else {
      // Clear selected friend when switching to regular accommodation
      setValue('selectedFriendId', undefined);

      // Clear friend accommodation when switching back
      if (selectedAccommodation?.type === 'friend') {
        setValue('accommodation', undefined);
      }
    }
  }, [stayingWithFriend, setValue, selectedAccommodation]);

  // Handle friend selection for accommodation
  const handleFriendSelect = (
    friendId: string,
    name: string,
    address: string
  ) => {
    setValue('selectedFriendId', friendId);
    setValue('accommodation', {
      name: `Staying with ${name}`,
      address: address,
      cost: 0,
      currency: 'USD',
      type: 'friend',
      friendId: friendId,
    });
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

    await addDestinationToRoute(transformedData);
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
              {isStartDestination ? 'Starting Point' : 'Details'}
            </TabsTrigger>
            {previousDestination && (
              <TabsTrigger value='accommodation' disabled={!location || !startDate || !endDate}>
                Accommodation
              </TabsTrigger>
            )}
            {previousDestination && (
              <TabsTrigger
                value='transport'
                disabled={!location || !previousDestination}
              >
                Transport
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value='destination' className='mt-2 space-y-4'>
            <DestinationForm
              route={route}
              previousDestination={previousDestination}
            />
          </TabsContent>

          <TabsContent value='accommodation' className='mt-2 space-y-4'>
            <div className='mb-4 flex items-center space-x-2'>
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
            </div>

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

          <Button
            type='submit'
            className='ml-auto rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600'
            hidden={!isValid}
          >
            Submit
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
