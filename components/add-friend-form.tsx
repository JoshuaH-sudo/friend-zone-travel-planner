'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import type { Friend } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPicker, PRESET_COLORS } from './color-picker';
import { Globe, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import useFetchAddress from './hooks/useFetchAddressCoordinates';
import useFetchTimezoneInformation from './hooks/useFetchTimeZoneInformation';
import { Coordinates } from '@/lib/actions';
import { secondsToHours } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';

interface AddFriendFormProps {
  friends: Friend[];
  onAddFriend: (friend: Friend) => void;
  onCancel: () => void;
}

export function AddFriendForm({
  friends,
  onAddFriend,
  onCancel,
}: AddFriendFormProps) {
  const t = useTranslations('friend');
  const takenColors = friends.map((f) => f.color);
  const availableColors = PRESET_COLORS.filter(
    (color) => !takenColors.includes(color)
  );
  const randomPreselectColor =
    availableColors[Math.floor(Math.random() * availableColors.length)];

  const formSchema = z.object({
    id: z.string(),
    name: z.string().nonempty({
      message: 'Name is required',
    }),
    color: z.string({
      message: 'Must select a color',
    }),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    address: z.string({
      message: 'Address is required',
    }),
    timezone: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: crypto.randomUUID(),
      name: '',
      color: randomPreselectColor,
      coordinates: undefined,
      address: '',
      timezone: '',
    },
  });
  const isValid = form.formState.isValid;

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { id, name, color, coordinates, address } = values;
    onAddFriend({
      id,
      name: name.trim(),
      color,
      coordinates,
      address,
      timezone: timezoneInformation?.timeZoneName!,
      availableDates: [],
    });
  }

  const address = form.watch('address');
  const coordinates = form.watch('coordinates');
  const {
    data: addressDetails,
    refetch: fetchAddress,
    isFetching: isFetchingAddress,
    isSuccess: isAddressSuccess,
    error: addressError,
  } = useFetchAddress(address);

  const {
    data: timezoneInformation,
    isFetching: isFetchingTimezone,
    error: timezoneInformationError,
  } = useFetchTimezoneInformation(coordinates);

  useEffect(() => {
    if (addressError) {
      form.setError('address', {
        type: 'manual',
        message: addressError.message,
      });
    } else {
      form.clearErrors('address');
    }
  }, [addressError]);

  useEffect(() => {
    if (timezoneInformationError) {
      form.setError('timezone', {
        type: 'manual',
        message: timezoneInformationError.message,
      });
    } else {
      form.clearErrors('timezone');
    }
  }, [timezoneInformationError]);

  useEffect(() => {
    if (addressDetails && isAddressSuccess) {
      form.clearErrors('address');
      // If the address is successfully (pre-)fetched, update the coordinates without the user having to click search
      const { lat, lng } = addressDetails.geometry.location;
      form.setValue('coordinates', { lat, lng });
    }
  }, [addressDetails, isAddressSuccess]);

  const onClickSearch = () => fetchAddress();
  
  let citySearchText = 'e.g. San Francisco';
  if (isFetchingAddress) citySearchText = 'Searching...';
  if (isAddressSuccess) citySearchText = addressDetails.formatted_address;

  let timezoneText = 'input a city';
  if (isAddressSuccess && timezoneInformation) {
    const timezoneOffsetSeconds =
      timezoneInformation.rawOffset + timezoneInformation.dstOffset;
    const timezoneOffsetHours = secondsToHours(timezoneOffsetSeconds);
    timezoneText = `${timezoneInformation.timeZoneName} (UTC${timezoneOffsetHours >= 0 ? '+' : ''}${timezoneOffsetHours})`;
  }

  const isLoading = isFetchingAddress || isFetchingTimezone;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <div className='space-y-2'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('name')}</FormLabel>

                <FormControl>
                  <Input placeholder='You friends name' {...field} />
                </FormControl>

                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='space-y-2'>
          <FormField
            control={form.control}
            name='color'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('color')}</FormLabel>
                <FormControl>
                  <ColorPicker
                    availableColors={availableColors}
                    color={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-row items-center gap-4'>
          <div className='w-[calc(50%-4rem)] space-y-2'>
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4 text-muted-foreground' />
                    <Label htmlFor='location'>{t('location')}</Label>
                  </FormLabel>

                  <FormControl>
                    <div className='flex items-center gap-2'>
                      <Input {...field} />
                      <Button
                        type='button'
                        onClick={onClickSearch}
                        disabled={isLoading}
                      >
                        Search
                      </Button>
                    </div>
                  </FormControl>

                  <FormDescription>
                    {addressError === null && citySearchText}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Globe className='h-4 w-4 text-muted-foreground' />
            <Label htmlFor='timezone'>{t('timezone')}</Label>
          </div>
          <p className='text-xs text-muted-foreground'>{timezoneText}</p>
        </div>

        <div className='flex justify-end gap-2'>
          <Button type='button' variant='outline' onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button type='submit' disabled={!isValid}>
            {t('addFriend')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
