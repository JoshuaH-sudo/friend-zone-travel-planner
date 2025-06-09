'use client';

import type React from 'react';
import type { Friend } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PRESET_COLORS } from '../color-picker';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import AddressField from './address-field';
import ColorPickerField from './color-picker-field';
import TimezoneFormField from './timezone-form-field';
import NameFormField from './name-form-field';

interface AddFriendFormProps {
  friends: Friend[];
  onAddFriend: (friend: Friend) => void;
  onCancel: () => void;
}

export const addFriendSchema = z.object({
  id: z.string(),
  name: z.string().nonempty({
    message: 'required',
  }),
  color: z.string({
    message: 'required',
  }),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  address: z.string({
    message: 'required',
  }),
  timezone: z.string(),
  timeZoneId: z.string(),
  timezoneOffset: z.number(),
});

export type addFriendFormContext = z.infer<typeof addFriendSchema>;

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

  const form = useForm<z.infer<typeof addFriendSchema>>({
    resolver: zodResolver(addFriendSchema),
    defaultValues: {
      id: crypto.randomUUID(),
      name: '',
      color: randomPreselectColor,
      address: '',
    },
  });

  function onSubmit(values: z.infer<typeof addFriendSchema>) {
    const {
      id,
      name,
      color,
      coordinates,
      address,
      timezone,
      timeZoneId,
      timezoneOffset,
    } = values;
    onAddFriend({
      id,
      name: name.trim(),
      color,
      coordinates,
      address,
      timezone,
      timezoneOffset,
      timeZoneId,
      availableDates: [],
      availableHours: {
        weekdays: [1, 24],
        weekends: [1, 24],
        dates: {},
      },
    });
  }

  const isValid = form.formState.isValid;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <NameFormField />

        <ColorPickerField friends={friends} />

        <AddressField friends={friends} className='w-[50%]' />

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
