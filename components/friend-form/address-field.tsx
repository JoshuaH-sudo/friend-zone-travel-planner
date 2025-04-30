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
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { Autocomplete } from '../ui/autocomplete';
import { useAddressAutocomplete } from '../hooks/useAddressAutocomplete';
import useFetchAddress from '../hooks/useFetchAddressCoordinates';
import { useEffect } from 'react';
import { useDebounce } from '@uidotdev/usehooks';

interface AddressFieldProps {
  friends: Friend[];
  className?: string;
}

function AddressField({ className }: AddressFieldProps) {
  const form = useFormContext();
  const t = useTranslations('friend.form.address');

  const address = form.watch('address');
  // const debouncedSearchTerm = useDebounce<string>(address, 300);
  const { suggestions, isLoading, error } = useAddressAutocomplete(address);

  // const { data: addressDetails, isSuccess: isAddressSuccess } = useFetchAddress(address);

  useEffect(() => {
    if (error) {
      form.setError('address', {
        type: 'manual',
        message: error.message,
      });
    } else {
      form.clearErrors('address');
    }
  }, [error]);

  // useEffect(() => {
  //   if (addressDetails && isAddressSuccess) {
  //     form.clearErrors('address');
  //     // If the address is successfully fetched, update the coordinates
  //     const { lat, lng } = addressDetails.geometry.location;
  //     form.setValue(
  //       'coordinates',
  //       { lat, lng },
  //       {
  //         shouldValidate: true,
  //         shouldDirty: true,
  //       }
  //     );
  //   }
  // }, [addressDetails, isAddressSuccess]);

  return (
    <div id='address-form-field' className={cn('space-y-2', className)}>
      <FormField
        control={form.control}
        name='address'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='flex items-center gap-2'>
              <MapPin className='h-4 w-4 text-muted-foreground' />
              <Label htmlFor='address'>{t('label')}</Label>
            </FormLabel>

            <FormControl>
              <div className='flex w-[70%]'>
                <Autocomplete
                  {...field}
                  placeholder={t('placeholder')}
                  loading={isLoading}
                  options={suggestions}
                  emptyMessage={t('no_results')}
                  onInputChange={(value) => {
                    field.onChange(value);
                  }}
                />
              </div>
            </FormControl>

            <FormDescription>
              {address && !error && t('searching')}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default AddressField;
