'use client';

import type React from 'react';
import type { Friend } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PRESET_COLORS } from './color-picker';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import AddressField from './add-friend-form/address-field';
import ColorPickerField from './add-friend-form/color-picker-field';
import TimezoneFormField from './add-friend-form/timezone-form-field';

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <div id="name-form-field" className='space-y-2'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('name')}</FormLabel>

                <FormControl>
                  <Input placeholder='You friends name' {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ColorPickerField friends={friends} />

        <AddressField friends={friends} />

        <TimezoneFormField />

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
