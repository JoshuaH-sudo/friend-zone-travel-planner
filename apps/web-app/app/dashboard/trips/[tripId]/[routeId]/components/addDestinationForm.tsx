'use client';

import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAddDestinationToRoute from '../hooks/useAddDestinationToRoute';
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
} from '@/components/ui/form';
import { AddDestinationToRouteProps } from '@/lib/actions/destinations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import FriendAccommodationSelector from './friendAccommodationSelector';
import AccommodationForm from './accommodationForm';
import ManualTransportForm from './transportForm';
import { Button } from '@/components/ui/button';
import DestinationForm from './destinationForm';

export interface NewDestination {
  routeId: string;
  location: string;
  friendIds: string[];
  days: number;
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
  days: z
    .number()
    .min(1, 'At least 1 day is required')
    .max(30, 'Maximum 30 days allowed'),
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

const tabs = [
  { value: 'destination', label: 'Details' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'transport', label: 'Transport' },
];

export interface AddDestinationFormProps {
  routeId: string;
  previousDestination?: {
    location: string;
    latitude: number;
    longitude: number;
  };
}

const AddDestinationForm: FC<AddDestinationFormProps> = ({
  routeId,
  previousDestination,
}) => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>('destination');

  const form = useForm<NewDestination>({
    defaultValues: {
      routeId,
      friendIds: [],
      days: 3,
      stayingWithFriend: false,
    },
    resolver: zodResolver(schema),
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = form;

  const location = watch('location');
  const days = watch('days');
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

  // Handle accommodation selection
  const handleAccommodationSubmit = (accommodation: {
    name: string;
    address: string;
    cost: number;
    currency: string;
    href?: string;
    type: 'hotel' | 'motel' | 'hostel' | 'friend' | 'airbnb' | 'other';
  }) => {
    setValue('accommodation', accommodation);
  };

  // Handle transport selection
  const handleTransportSelect = (transport: {
    name: string;
    address: string;
    cost: number;
    currency: string;
    href?: string;
    type: 'airplane' | 'bus' | 'car' | 'train' | 'ferry' | 'other';
    departureAt?: Date;
    arrivalAt?: Date;
    duration?: number;
  }) => {
    setValue('transport', transport);
  };

  const { mutateAsync: addDestinationToRoute } = useAddDestinationToRoute({
    onSuccess: () => {
      reset();
      setActiveTab('destination');
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
      days: data.days,
      latitude: data.latitude,
      longitude: data.longitude,
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

  const currentTabIndex = tabs.findIndex((tab) => tab.value === activeTab);
  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex h-full flex-col gap-1'
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full h-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='destination'>Destination</TabsTrigger>
            <TabsTrigger
              value='accommodation'
              disabled={!location || !days}
            >
              Accommodation
            </TabsTrigger>
            <TabsTrigger
              value='transport'
              disabled={!location || !days || !previousDestination}
            >
              Transport
            </TabsTrigger>
          </TabsList>

          <TabsContent value='destination' className='mt-2 space-y-4'>
            <DestinationForm />
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
              location &&
              days && (
                <AccommodationForm
                  location={location}
                  onSubmit={handleAccommodationSubmit}
                />
              )
            )}
          </TabsContent>

          <TabsContent value='transport' className='mt-2 space-y-4'>
            {previousDestination && location && days && (
              <ManualTransportForm
                onSubmit={handleTransportSelect}
                fromLocation={previousDestination.location}
                toLocation={location}
              />
            )}
          </TabsContent>
        </Tabs>

        <div className='mt-4 flex justify-between'>
          {currentTabIndex > 0 && (
            <Button
              type='button'
              className='rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300'
              onClick={() =>
                setActiveTab(tabs[currentTabIndex - 1]?.value)
              }
            >
              Back
            </Button>
          )}

          {currentTabIndex < tabs.length - 1 && (
            <Button
              type='button'
              className='ml-auto rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
              onClick={() => {
                setActiveTab(tabs[currentTabIndex + 1]?.value);
              }}
              disabled={activeTab === 'destination' && (!location || !days)}
            >
              Next
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default AddDestinationForm;
