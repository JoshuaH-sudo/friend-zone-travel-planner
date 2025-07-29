'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Autocomplete } from '@/components/ui/autocomplete';
import { Loader2, MapPin, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAddressAutocomplete } from '@/hooks/useAddressAutocomplete';
import createFriend from '../actions/createFriend';
import { getAddressCoordinates } from '@/lib/actions/google';

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
  const [previewCoordinates, setPreviewCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [searchInput, setSearchInput] = useState<string>('');

  const queryClient = useQueryClient();
  const { suggestions } = useAddressAutocomplete(searchInput);

  const form = useForm<FriendFormData>({
    resolver: zodResolver(friendSchema),
    defaultValues: {
      name: '',
      address: '',
    },
  });

  const { formState } = form;
  const { isValid } = formState;

  const {
    mutate: createFriendMutation,
    isPending: isCreateFriendPending,
    error: createFriendError,
  } = useMutation({
    mutationFn: createFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      form.reset();
      setPreviewCoordinates(null);
      setSearchInput('');
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error creating friend:', error);
    },
  });

  const watchedValues = form.watch();

  const handlePreviewAddress = async () => {
    const { address } = watchedValues;

    if (!address) {
      return;
    }

    setIsPreviewLoading(true);
    try {
      const result = await getAddressCoordinates(address);

      if (result.status === 'OK' && result.results) {
        setPreviewCoordinates({
          lat: result.results.geometry.location.lat,
          lng: result.results.geometry.location.lng,
        });
      }
    } catch (error) {
      console.error('Error previewing address:', error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const onSubmit = async (data: FriendFormData) => {
    createFriendMutation({
      name: data.name.trim(),
      address: data.address.trim(),
    });
  };

  return (
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
                          value={searchInput}
                          options={suggestions}
                          placeholder="Enter friend's address"
                          emptyMessage="No results found"
                          onInputChange={(value) => {
                            setSearchInput(value);
                          }}
                          onSelect={(suggestion) => {
                            // Update the form with the selected address
                            const selectedAddress = suggestion.text.text;
                            setSearchInput(selectedAddress);
                            form.setValue('address', selectedAddress);
                            field.onChange(selectedAddress);
                          }}
                          onClear={() => {
                            setSearchInput('');
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

            {/* Address Preview */}
            <div className='border-t pt-4'>
              <div className='mb-2 flex items-center justify-between'>
                <Label>Address Preview</Label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={handlePreviewAddress}
                  disabled={
                    isPreviewLoading ||
                    !watchedValues.address
                  }
                >
                  {isPreviewLoading ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <MapPin className='mr-2 h-4 w-4' />
                  )}
                  Preview Location
                </Button>
              </div>

              {previewCoordinates && (
                <div className='rounded-lg border border-green-200 bg-green-50 p-3'>
                  <div className='flex items-center text-sm text-green-800'>
                    <MapPin className='mr-2 h-4 w-4' />
                    <span>
                      Location found: {previewCoordinates.lat.toFixed(6)},{' '}
                      {previewCoordinates.lng.toFixed(6)}
                    </span>
                  </div>
                </div>
              )}
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
  );
};

export default AddFriendForm;
