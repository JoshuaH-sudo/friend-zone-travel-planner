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
import deleteRoute from '../actions/deleteRoute';
import { useRouter } from 'next/navigation';

interface DeleteRouteDialogProps {
  route: { id: string; name?: string } | null;
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteRouteDialog = ({
  route,
  tripId,
  open,
  onOpenChange,
}: DeleteRouteDialogProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async () => {
      if (!route) throw new Error('No route to delete');
      return deleteRoute(route.id, tripId);
    },
    onSuccess: () => {
      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ['routes', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      onOpenChange(false);
      // Refresh the page to fetch updated routes from the server
      router.refresh();
    },
    onError: (error) => {
      console.error('Error deleting route:', error);
    },
  });

  const handleDelete = async () => {
    await mutateAsync();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Route</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <strong>{route?.name || 'this route'}</strong>?
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
              'Delete Route'
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

export default DeleteRouteDialog;
