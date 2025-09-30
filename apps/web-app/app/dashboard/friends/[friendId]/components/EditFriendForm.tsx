'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import updateFriend from '../actions/updateFriend';
import { Friend } from '../../hooks/useGetFriends';
import MapView, { Poi } from '../../new-friend/components/MapView';
import useGetAddressCoordinates from '@/app/dashboard/trips/[tripId]/hooks/useGetAddressCoordinates';

interface EditFriendFormProps {
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
  const queryClient = useQueryClient();

  const form = useForm<FriendFormData>({
    resolver: zodResolver(friendSchema),
    defaultValues: {
      name: friend.name,
      address: friend.location || '',
    },
  });

  const watchedAddress = form.watch('address');
  const { data: addressCoordinates } = useGetAddressCoordinates(watchedAddress);

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

  const onSubmit = async (data: FriendFormData) => {
    updateFriendMutation.mutate({
      id: friend.id,
      name: data.name.trim(),
      address: data.address.trim(),
    });
  };

  return (
    <div className='flex justify-center gap-2'>
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

      <div className='relative h-[500px] w-full'>
        <MapView locations={locations} />
      </div>
    </div>
  );
};

export default EditFriendForm;
