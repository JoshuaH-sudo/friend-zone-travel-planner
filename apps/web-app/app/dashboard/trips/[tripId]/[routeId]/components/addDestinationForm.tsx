'use client';

import { DatePickerWithRange } from '@/components/ui/datePickerWithRange';
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
  FormMessage,
} from '@/components/ui/form';
import { Autocomplete } from '@/components/ui/autocomplete';
import { Combobox } from '@/components/ui/combo-box';
import { AddDestinationToRouteProps } from '@/lib/actions/destinations';
import useGetFriendsByGeoLocation from '../hooks/useGetFriendsByGeoLocation';
import useGetAddressCoordinates from '../hooks/useGetAddressCoordinates';
import { useDebouncedValue } from '@tanstack/react-pacer';
import { useAddressAutocomplete } from '@/hooks/useAddressAutocomplete';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import FriendAccommodationSelector from './friendAccommodationSelector';
import AccommodationSelector from './accommodationSelector';
import TransportSelector from './transportSelector';

export interface NewDestination {
  routeId: string;
  location: string;
  friendIds: string[];
  dateRange: {
    from: Date;
    to: Date;
  };
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
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  stayingWithFriend: z.boolean().default(false),
  selectedFriendId: z.string().optional(),
  accommodation: z.object({
    name: z.string(),
    address: z.string(),
    cost: z.number(),
    currency: z.string(),
    href: z.string().optional(),
    type: z.enum(['hotel', 'motel', 'hostel', 'friend', 'airbnb', 'other']),
    friendId: z.string().optional(),
  }).optional(),
  transport: z.object({
    name: z.string(),
    address: z.string(),
    cost: z.number(),
    currency: z.string(),
    href: z.string().optional(),
    type: z.enum(['airplane', 'bus', 'car', 'train', 'ferry', 'other']),
    departureAt: z.date().optional(),
    arrivalAt: z.date().optional(),
    duration: z.number().optional(),
  }).optional(),
});

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
  previousDestination
}) => {
  const queryClient = useQueryClient();
  const [addressSearchInput, setAddressSearchInput] = useState<string>('');
  const { suggestions } = useAddressAutocomplete(addressSearchInput);
  const [activeTab, setActiveTab] = useState<string>('details');

  const form = useForm<NewDestination>({
    defaultValues: {
      routeId,
      friendIds: [],
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
    formState: { isValid },
  } = form;

  const location = watch('location');
  const dateRange = watch('dateRange');
  const stayingWithFriend = watch('stayingWithFriend');
  const selectedFriendId = watch('selectedFriendId');
  const selectedAccommodation = watch('accommodation');
  const selectedTransport = watch('transport');

  const [debouncedValue] = useDebouncedValue(location, {
    wait: 1000,
  });

  const { data: coordinates, refetch } = useGetAddressCoordinates(debouncedValue, { enabled: false });
  const { data: friends, isLoading: isFriendsLoading, error: friendsError, refetch: refetchFriends } = useGetFriendsByGeoLocation(
    coordinates?.geometry?.location
  );

  useEffect(() => {
    if (debouncedValue && debouncedValue.trim().length > 0) {
      console.log('Refetching coordinates for:', debouncedValue);
      refetch();
    }
  }, [debouncedValue, refetch]);

  useEffect(() => {
    if (coordinates) {
      setValue('latitude', coordinates.geometry.location.lat);
      setValue('longitude', coordinates.geometry.location.lng);
    }
  }, [coordinates, setValue]);

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
  const handleFriendSelect = (friendId: string, name: string, address: string) => {
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
  const handleAccommodationSelect = (accommodation: {
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
      setActiveTab('details');
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

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex h-full flex-col gap-1'
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger 
              value="accommodation" 
              disabled={!location || !dateRange?.from || !dateRange?.to}
            >
              Accommodation
            </TabsTrigger>
            <TabsTrigger 
              value="transport" 
              disabled={!location || !dateRange?.from || !dateRange?.to || !previousDestination}
            >
              Transport
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-2">
            <div>
              <FormField
                control={control}
                name='location'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Autocomplete
                        {...field}
                        value={addressSearchInput}
                        options={suggestions}
                        placeholder="Enter your destination"
                        emptyMessage='No results found'
                        onInputChange={(value) => {
                          setAddressSearchInput(value);
                        }}
                        onSelect={(suggestion) => {
                          console.log('Selected suggestion:', suggestion);
                          // Update the form with the selected address
                          const selectedAddress = suggestion.text.text;
                          setAddressSearchInput(selectedAddress);
                          setValue('location', selectedAddress);
                          field.onChange(selectedAddress);
                        }}
                        onClear={() => {
                          setAddressSearchInput('');
                          setValue('location', '');
                          field.onChange('');
                        }}
                      />
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

            <div>
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
          </TabsContent>
          
          <TabsContent value="accommodation" className="space-y-4 mt-2">
            <div className="flex items-center space-x-2 mb-4">
              <FormField
                control={control}
                name="stayingWithFriend"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
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
                friends={friends || []}
                isLoading={isFriendsLoading}
                error={friendsError}
                selectedFriendId={selectedFriendId || null}
                onSelectFriend={handleFriendSelect}
                onRefresh={refetchFriends}
              />
            ) : (
              location && dateRange?.from && dateRange?.to && (
                <AccommodationSelector
                  location={location}
                  checkInDate={dateRange.from.toISOString().split('T')[0]}
                  checkOutDate={dateRange.to.toISOString().split('T')[0]}
                  selectedAccommodation={selectedAccommodation || null}
                  onSelectAccommodation={handleAccommodationSelect}
                />
              )
            )}
          </TabsContent>
          
          <TabsContent value="transport" className="space-y-4 mt-2">
            {previousDestination && location && dateRange?.from && (
              <TransportSelector
                fromLocation={previousDestination.location}
                toLocation={location}
                departureDate={dateRange.from.toISOString().split('T')[0]}
                selectedTransport={selectedTransport || null}
                onSelectTransport={handleTransportSelect}
              />
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-4">
          {activeTab !== "details" && (
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
              onClick={() => setActiveTab(activeTab === "accommodation" ? "details" : "accommodation")}
            >
              Back
            </button>
          )}
          
          {activeTab !== "transport" ? (
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 rounded-md text-white hover:bg-blue-600 ml-auto"
              onClick={() => {
                if (activeTab === "details" && location && dateRange?.from && dateRange?.to) {
                  setActiveTab("accommodation");
                } else if (activeTab === "accommodation") {
                  setActiveTab("transport");
                }
              }}
              disabled={activeTab === "details" && (!location || !dateRange?.from || !dateRange?.to)}
            >
              Next
            </button>
          ) : (
            <button
              id='add-destination'
              className='px-4 py-2 bg-green-500 rounded-md text-white hover:bg-green-600 ml-auto'
              type='submit'
              disabled={!isValid}
            >
              Add Destination
            </button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default AddDestinationForm;
