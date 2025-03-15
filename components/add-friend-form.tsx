'use client';

import type React from 'react';

import { useState } from 'react';
import type { Friend } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorPicker, PRESET_COLORS } from './color-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
  const [name, setName] = useState('');
  const availableColors = PRESET_COLORS.filter(
    (c) => !friends.some((f) => f.color === c)
  );
  const randomColor =
    availableColors[Math.floor(Math.random() * availableColors.length)];
  const [color, setColor] = useState(randomColor);
  const [timezone, setTimezone] = useState('UTC');

  // Common timezones
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddFriend({
        id: crypto.randomUUID(),
        name: name.trim(),
        color,
        timezone,
        availableDates: [],
      });
      setName('');
      setColor('#3b82f6');
      setTimezone('UTC');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='friend-name'>{t('name')}</Label>
        <Input
          id='friend-name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('namePlaceholder')}
          required
        />
      </div>

      <div className='space-y-2'>
        <Label>{t('color')}</Label>
        <ColorPicker
          availableColors={availableColors}
          color={color}
          onChange={setColor}
        />
      </div>

      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <Globe className='h-4 w-4 text-muted-foreground' />
          <Label htmlFor='timezone'>{t('timezone')}</Label>
        </div>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger id='timezone'>
            <SelectValue placeholder={t('timezonePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {timezones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type='submit' disabled={!name.trim()}>
          {t('addFriend')}
        </Button>
      </div>
    </form>
  );
}
