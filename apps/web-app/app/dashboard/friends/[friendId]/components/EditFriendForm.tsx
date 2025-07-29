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
  address: z.string().min(1, 'Address is required'),
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
      address: friend.location || '',
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
    updateFriendMutation.mutate({
      id: friend.id,
      name: data.name.trim(),
      address: data.address.trim(),
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
              <Label htmlFor='address'>Address *</Label>
              <Input
                id='address'
                {...form.register('address')}
                placeholder="Enter friend's address"
                disabled={updateFriendMutation.isPending}
              />
              {form.formState.errors.address && (
                <p className='mt-1 text-sm text-red-500'>
                  {form.formState.errors.address.message}
                </p>
              )}
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
