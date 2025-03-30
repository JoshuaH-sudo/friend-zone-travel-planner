'use client';

import type React from 'react';
import type { Friend } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PRESET_COLORS } from './color-picker';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Form } from './ui/form';
import AddressField from './add-friend-form/address-field';
import ColorPickerField from './add-friend-form/color-picker-field';
import TimezoneFormField from './add-friend-form/timezone-form-field';
import NameFormField from './add-friend-form/name-form-field';
import { useEffect } from 'react';

interface AddFriendFormProps {
  friends: Friend[];
  onAddFriend: (friend: Friend) => void;
  onCancel: () => void;
}

export const addFriendSchema = z.object({
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
    },
  });

  useEffect(() => {
    form.setValue('color', randomPreselectColor, {
      // Need to trigger validation and dirty state manually
      // Or else the form will not be valid automatically
      // when the timezone and coordinates are set at the end.
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [randomPreselectColor]);

  function onSubmit(values: z.infer<typeof addFriendSchema>) {
    const { id, name, color, coordinates, address, timezone, timezoneOffset } =
      values;
    onAddFriend({
      id,
      name: name.trim(),
      color,
      coordinates,
      address,
      timezone,
      timezoneOffset,
      availableDates: [],
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
