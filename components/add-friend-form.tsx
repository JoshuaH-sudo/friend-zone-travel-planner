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
import { getAddressCoordinates } from '@/lib/actions';
import useFetchAddress from './hooks/useFetchAddressCoordinates';

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
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  const {
    data: addressDetails,
    refetch: fetchAddress,
    isFetching: isFetchingAddress,
    isSuccess: isAddressSuccess,
  } = useFetchAddress(address);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddFriend({
        id: crypto.randomUUID(),
        name: name.trim(),
        color,
        coordinates: { lat: 0, lng: 0 },
        address,
        timezone: 'UTC',
        availableDates: [],
      });
      setName('');
      setColor('#3b82f6');
      setAddress('UTC');
    }
  };

  const searchAddress = async () => {
    const result = await fetchAddress();
    console.log('query results', result);
    if (result.data) {
      const { lat, lng } = result.data.geometry.location;
      console.log('Coordinates', { lat, lng });
      setCoordinates({ lat, lng });
    }
  };

  let citySearchText = 'e.g. San Francisco';
  if (isFetchingAddress) citySearchText = 'Searching...';
  if (isAddressSuccess) citySearchText = addressDetails.formatted_address;

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
          <MapPin className='h-4 w-4 text-muted-foreground' />
          <Label htmlFor='city'>{t('city')}</Label>
        </div>
        <div className='flex flex-row gap-2'>
          <div className='flex w-[calc(50%-4rem)] flex-col items-start gap-2'>
            <Input
              id='city'
              disabled={isFetchingAddress}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
            <p className='text-xs text-muted-foreground'>{citySearchText}</p>
          </div>

          <Button onClick={searchAddress} disabled={isFetchingAddress}>
            Search
          </Button>
        </div>
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
