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
import useDeleteRouteById from '../hooks/useDeleteRouteById';
import { TripByIdResponse } from '../../actions/getTripById';

interface DeleteRouteDialogProps {
  route: TripByIdResponse['routes'][0] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteRouteDialog = ({
  route,
  open,
  onOpenChange,
}: DeleteRouteDialogProps) => {
  const { mutateAsync, isPending, error } = useDeleteRouteById({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const handleDelete = async () => {
    if (!route) return;
    await mutateAsync({ routeId: route.id, tripId: route.trip_id });
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
