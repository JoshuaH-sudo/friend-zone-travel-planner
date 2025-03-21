'use client';

import { Friend } from '@/lib/types';
import { MapPin } from 'lucide-react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '../ui/form';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '../ui/input';
import useFetchAddress from '../hooks/useFetchAddressCoordinates';
import { useEffect } from 'react';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

interface AddressFieldProps {
  friends: Friend[];
}
function AddressField({ friends }: AddressFieldProps) {
  const form = useFormContext();
  const t = useTranslations('friend');

  const address = form.watch('address');
  const {
    data: addressDetails,
    refetch: fetchAddress,
    isFetching: isFetchingAddress,
    isSuccess: isAddressSuccess,
    error: addressError,
  } = useFetchAddress(address);
  const onClickSearch = () => fetchAddress();

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
    if (addressDetails && isAddressSuccess) {
      form.clearErrors('address');
      // If the address is successfully (pre-)fetched, update the coordinates without the user having to click search
      const { lat, lng } = addressDetails.geometry.location;
      form.setValue('coordinates', { lat, lng });
    }
  }, [addressDetails, isAddressSuccess]);

  // TODO: Add a loading spinner
  // TODO: Translate the placeholder text
  let citySearchText = 'e.g. San Francisco';
  if (isFetchingAddress) citySearchText = 'Searching...';
  if (isAddressSuccess) citySearchText = addressDetails.formatted_address;

  const isLoading = isFetchingAddress;
  return (
    <div id='address-form-field' className='flex flex-row items-center gap-4'>
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
  );
}

export default AddressField;
