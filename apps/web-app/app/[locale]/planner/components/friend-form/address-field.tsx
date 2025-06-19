'use client';

import { Friend } from '@/lib/types';
import { MapPin } from 'lucide-react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useAddressAutocomplete } from '@/app/[locale]/planner/hooks/useAddressAutocomplete';
import useFetchAddress from '@/app/[locale]/planner/hooks/useFetchAddressCoordinates';
import { useEffect, useState } from 'react';

interface AddressFieldProps {
  friends: Friend[];
  className?: string;
}

function AddressField({ className }: AddressFieldProps) {
  const form = useFormContext();
  const t = useTranslations('friend.form.address');

  const address = form.watch('address');
  const [searchInput, setSearchInput] = useState<string>(address);
  const { suggestions, error } = useAddressAutocomplete(searchInput);

  const { data: addressDetails, isSuccess: isAddressSuccess } =
    useFetchAddress(address);

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

  useEffect(() => {
    if (addressDetails && isAddressSuccess) {
      form.clearErrors('address');
      // If the address is successfully fetched, update the coordinates
      const { lat, lng } = addressDetails.geometry.location;
      form.setValue(
        'coordinates',
        { lat, lng },
        {
          shouldValidate: true,
          shouldDirty: true,
        }
      );
    }
  }, [addressDetails, isAddressSuccess]);

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
              <div className='flex w-[50%]'>
                <Autocomplete
                  {...field}
                  value={searchInput}
                  options={suggestions}
                  placeholder={t('placeholder')}
                  emptyMessage={t('noResults')}
                  onInputChange={(value) => {
                    setSearchInput(value);
                  }}
                  onSelect={(value) => {
                    // Only want to set the address and get the timezone
                    // when the user selects an address from the suggestions
                    setSearchInput(value);
                    field.onChange(value);
                  }}
                  onClear={() => {
                    setSearchInput('');
                    field.onChange(null);
                  }}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default AddressField;
