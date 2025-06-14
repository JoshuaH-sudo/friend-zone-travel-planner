'use client';

import type React from 'react';

import type { Friend } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import AddressField from './address-field';
import ColorPickerField from './color-picker-field';
import NameFormField from './name-form-field';
import TimezoneFormField from './timezone-form-field';

interface EditFriendFormProps {
  friend: Friend;
  friends: Friend[];
  onSave: (updatedFriend: Friend) => void;
  onCancel: () => void;
}

export const addFriendSchema = z.object({
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

export function EditFriendForm({
  friend,
  friends,
  onSave,
  onCancel,
}: EditFriendFormProps) {
  const t = useTranslations('friend');

  const form = useForm<z.infer<typeof addFriendSchema>>({
    resolver: zodResolver(addFriendSchema),
    defaultValues: {
      ...friend,
      coordinates: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof addFriendSchema>) {
    const { name, color, coordinates, address, timezone, timezoneOffset } =
      values;
    onSave({
      ...friend,
      name: name.trim(),
      color,
      coordinates,
      address,
      timezone,
      timezoneOffset,
    });
  }

  const isValid = form.formState.isValid;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <NameFormField />

        <ColorPickerField selectedFriendId={friend.id} friends={friends} />

        <AddressField friends={friends} />

        <TimezoneFormField />

        <div className='flex justify-end gap-2'>
          <Button type='button' variant='outline' onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button type='submit' disabled={!isValid}>
            {t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
