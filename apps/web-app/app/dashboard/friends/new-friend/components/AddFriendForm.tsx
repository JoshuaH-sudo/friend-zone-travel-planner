'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Autocomplete } from '@/components/ui/autocomplete';
import { Loader2, MapPin, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAddressAutocomplete } from '@/hooks/useAddressAutocomplete';
import createFriend from '../actions/createFriend';
import MapView, { Poi } from './MapView';
import useGetAddressCoordinates from '@/app/dashboard/trips/[tripId]/hooks/useGetAddressCoordinates';

interface AddFriendFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const friendSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
});

type FriendFormData = z.infer<typeof friendSchema>;

const AddFriendForm = ({ onSuccess, onCancel }: AddFriendFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<FriendFormData>({
    resolver: zodResolver(friendSchema),
    defaultValues: {
      name: '',
      address: '',
    },
  });
  const { formState, watch } = form;
  const { isValid } = formState;

  const formAddress = watch('address');
  const { data: addressCoordinates } = useGetAddressCoordinates(formAddress);
  const [addressSearchInput, setAddressSearchInput] = useState<string>('');
  const { suggestions } = useAddressAutocomplete(addressSearchInput);

  const {
    mutate: createFriendMutation,
    isPending: isCreateFriendPending,
    error: createFriendError,
  } = useMutation({
    mutationFn: createFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      form.reset();
      setAddressSearchInput('');
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error creating friend:', error);
    },
  });

  const onSubmit = async (data: FriendFormData) => {
    createFriendMutation({
      name: data.name.trim(),
      address: data.address.trim(),
    });
  };

  const locations: Poi[] = useMemo(() => {
    if (!addressCoordinates) {
      return [];
    }

    return [
      {
        key: addressCoordinates.place_id,
        location: {
          lat: addressCoordinates.geometry.location.lat,
          lng: addressCoordinates.geometry.location.lng,
        },
      },
    ];
  }, [addressCoordinates]);
  return (
    <div className='flex justify-center gap-2'>
      <Card className='w-full max-w-2xl'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Add New Friend</CardTitle>
            {onCancel && (
              <Button variant='ghost' size='sm' onClick={onCancel}>
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-1 gap-4'>
                <div>
                  <Label htmlFor='name'>Name *</Label>
                  <Input
                    id='name'
                    {...form.register('name')}
                    placeholder="Enter friend's name"
                    disabled={isCreateFriendPending}
                  />
                  {form.formState.errors.name && (
                    <p className='mt-1 text-sm text-red-500'>
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center gap-2'>
                        <MapPin className='text-muted-foreground h-4 w-4' />
                        <Label htmlFor='address'>Address *</Label>
                      </FormLabel>

                      <FormControl>
                        <div className='flex w-full'>
                          <Autocomplete
                            {...field}
                            value={addressSearchInput}
                            options={suggestions}
                            placeholder="Enter friend's address"
                            emptyMessage='No results found'
                            onInputChange={(value) => {
                              setAddressSearchInput(value);
                            }}
                            onSelect={(suggestion) => {
                              console.log('Selected suggestion:', suggestion);
                              // Update the form with the selected address
                              const selectedAddress = suggestion.text.text;
                              setAddressSearchInput(selectedAddress);
                              form.setValue('address', selectedAddress);
                              field.onChange(selectedAddress);
                            }}
                            onClear={() => {
                              setAddressSearchInput('');
                              form.setValue('address', '');
                              field.onChange('');
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Actions */}
              <div className='flex justify-end space-x-2 pt-4'>
                {onCancel && (
                  <Button type='button' variant='outline' onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                <Button
                  type='submit'
                  disabled={isCreateFriendPending || !isValid}
                >
                  {isCreateFriendPending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Adding Friend...
                    </>
                  ) : (
                    'Add Friend'
                  )}
                </Button>
              </div>

              {createFriendError && (
                <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                  <p className='text-sm text-red-800'>
                    {createFriendError.message}
                  </p>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className='relative h-[500px] w-full'>
        <MapView locations={locations} />
      </div>
    </div>
  );
};

export default AddFriendForm;
