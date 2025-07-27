'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import updateFriend from '../actions/updateFriend';
import { getAddressCoordinates } from '@/lib/actions/google';
// import { Database } from '@/supabase/database.types'
import { Friend } from '../../hooks/useGetFriends';

interface EditFriendFormProps {
  // friend: Database['public']['Tables']['friends']['Row']
  friend: Friend;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const friendSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state_province: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  postal_code: z.string().optional(),
})

type FriendFormData = z.infer<typeof friendSchema>

const EditFriendForm = ({
  friend,
  onSuccess,
  onCancel,
}: EditFriendFormProps) => {
  const [previewCoordinates, setPreviewCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const queryClient = useQueryClient();

  const form = useForm<FriendFormData>({
    resolver: zodResolver(friendSchema),
    defaultValues: {
      name: friend.name,
      street: friend.street || '',
      city: friend.city || '',
      state_province: friend.state_province || '',
      country: friend.country || '',
      postal_code: friend.postal_code || '',
    },
  });

  useEffect(() => {
    // Set initial preview coordinates
    setPreviewCoordinates({
      lat: friend.latitude,
      lng: friend.longitude,
    });
  }, [friend]);

  const updateFriendMutation = useMutation({
    mutationFn: (data: { id: string } & Partial<FriendFormData>) =>
      updateFriend(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error updating friend:', error);
    },
  });

  const watchedValues = form.watch();

  const handlePreviewAddress = async () => {
    const { street, city, country, state_province, postal_code } = watchedValues;
    
    if (!street || !city || !country) {
      return;
    }

    setIsPreviewLoading(true);
    try {
      const addressParts = [
        street,
        city,
        state_province,
        country,
        postal_code,
      ].filter(Boolean);

      const fullAddress = addressParts.join(', ');
      const result = await getAddressCoordinates(fullAddress);

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
    updateFriendMutation.mutate({
      id: friend.id,
      name: data.name.trim(),
      street: data.street.trim(),
      city: data.city.trim(),
      state_province: data.state_province?.trim() || undefined,
      country: data.country.trim(),
      postal_code: data.postal_code?.trim() || undefined,
    });
  };

  return (
    <Card className='w-full max-w-2xl'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Edit Friend</CardTitle>
          {onCancel && (
            <Button variant='ghost' size='sm' onClick={onCancel}>
              <X className='h-4 w-4' />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid grid-cols-1 gap-4'>
            <div>
              <Label htmlFor='name'>Name *</Label>
              <Input
                id='name'
                {...form.register('name')}
                placeholder="Enter friend's name"
                disabled={updateFriendMutation.isPending}
              />
              {form.formState.errors.name && (
                <p className='mt-1 text-sm text-red-500'>
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor='street'>Street Address *</Label>
              <Input
                id='street'
                {...form.register('street')}
                placeholder='123 Main Street'
                disabled={updateFriendMutation.isPending}
              />
              {form.formState.errors.street && (
                <p className='mt-1 text-sm text-red-500'>
                  {form.formState.errors.street.message}
                </p>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='city'>City *</Label>
                <Input
                  id='city'
                  {...form.register('city')}
                  placeholder='New York'
                  disabled={updateFriendMutation.isPending}
                />
                {form.formState.errors.city && (
                  <p className='mt-1 text-sm text-red-500'>
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor='state_province'>State/Province</Label>
                <Input
                  id='state_province'
                  {...form.register('state_province')}
                  placeholder='NY'
                  disabled={updateFriendMutation.isPending}
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='country'>Country *</Label>
                <Input
                  id='country'
                  {...form.register('country')}
                  placeholder='United States'
                  disabled={updateFriendMutation.isPending}
                />
                {form.formState.errors.country && (
                  <p className='mt-1 text-sm text-red-500'>
                    {form.formState.errors.country.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor='postal_code'>Postal Code</Label>
                <Input
                  id='postal_code'
                  {...form.register('postal_code')}
                  placeholder='10001'
                  disabled={updateFriendMutation.isPending}
                />
              </div>
            </div>
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
                  !watchedValues.street ||
                  !watchedValues.city ||
                  !watchedValues.country
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
                    Location: {previewCoordinates.lat.toFixed(6)},{' '}
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
            <Button type='submit' disabled={updateFriendMutation.isPending}>
              {updateFriendMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Updating Friend...
                </>
              ) : (
                'Update Friend'
              )}
            </Button>
          </div>

          {updateFriendMutation.error && (
            <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
              <p className='text-sm text-red-800'>
                {updateFriendMutation.error.message}
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default EditFriendForm;
