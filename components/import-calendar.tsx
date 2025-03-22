'use client';

import type React from 'react';

import { useState } from 'react';
import { parseIcalFile } from '@/lib/ical';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Friend } from '@/lib/types';
import { Download, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations } from 'next-intl';
import { timezone } from '@googlemaps/google-maps-services-js/dist/timezone';
import { color } from 'html2canvas/dist/types/css/types/color';
import AddressField from './add-friend-form/address-field';
import ColorPickerField from './add-friend-form/color-picker-field';
import NameFormField from './add-friend-form/name-form-field';
import TimezoneFormField from './add-friend-form/timezone-form-field';
import { addFriendSchema } from './add-friend-form';
import { z } from 'zod';
import { Form } from './ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PRESET_COLORS } from './color-picker';

interface ImportCalendarProps {
  friends: Friend[];
  onImport: (friend: Friend) => void;
  onCancel: () => void;
}

export function ImportCalendar({
  friends,
  onImport,
  onCancel,
}: ImportCalendarProps) {
  const t = useTranslations();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      coordinates: undefined,
      address: '',
      timezone: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  async function onSubmit(values: z.infer<typeof addFriendSchema>) {
    const { id, name, color, coordinates, address, timezone, timezoneOffset } =
      values;
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { dates } = await parseIcalFile(file);

      onImport({
        id,
        name: name.trim(),
        color,
        coordinates,
        address,
        timezone,
        timezoneOffset,
        availableDates: dates,
      });
    } catch (err) {
      setError(
        "Failed to parse the iCal file. Please make sure it's a valid .ics file."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const isValid = form.formState.isValid;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='calendar-file'>{t('calendar.icalFile')}</Label>
          <Input
            id='calendar-file'
            type='file'
            accept='.ics'
            onChange={handleFileChange}
            className='cursor-pointer'
          />
          <p className='text-xs text-muted-foreground'>
            {t('calendar.importCalendarDescription')}
          </p>
        </div>

        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <NameFormField />

        <ColorPickerField friends={friends} />

        <AddressField friends={friends} />

        <TimezoneFormField />

        <div className='flex justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isLoading}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            type='submit'
            disabled={!file || isLoading || !isValid}
            className='gap-2'
          >
            {isLoading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                {t('state.importing')}
              </>
            ) : (
              <>
                <Download className='h-4 w-4' />
                {t('actions.import')}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
