'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import deleteTrip from '../actions/deleteTrip';

interface DeleteTripDialogProps {
  trip: { id: string; name: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteTripDialog = ({
  trip,
  open,
  onOpenChange,
}: DeleteTripDialogProps) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: deleteTrip,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trips'] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error deleting trip:', error);
    },
  });

  const handleDelete = async () => {
    if (trip) {
      await mutateAsync(trip.id);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Trip</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{trip?.name}</strong>?
            <div className='mt-2 text-sm text-red-600'>
              This action cannot be undone.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className='bg-red-600 hover:bg-red-700'
          >
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Deleting...
              </>
            ) : (
              'Delete Trip'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
        {error && (
          <div className='mt-2 rounded-lg border border-red-200 bg-red-50 p-3'>
            <p className='text-sm text-red-800'>{(error as Error).message}</p>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTripDialog;
