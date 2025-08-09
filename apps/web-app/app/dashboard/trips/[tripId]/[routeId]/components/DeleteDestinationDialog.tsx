'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import deleteDestination from '../actions/deleteDestination'

interface DeleteDestinationDialogProps {
  destination: { id: string; location?: string } | null
  tripId: string
  routeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DeleteDestinationDialog = ({ destination, tripId, routeId, open, onOpenChange }: DeleteDestinationDialogProps) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      if (!destination) throw new Error('No destination to delete')
      return deleteDestination(destination.id, routeId, tripId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations', routeId] })
      onOpenChange(false)
    },
    onError: (error) => {
      console.error('Error deleting destination:', error)
    },
  })

  const handleDelete = () => {
    mutation.mutate()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Destination</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{destination?.location || 'this destination'}</strong>?
            <div className="mt-2 text-sm text-red-600">This action cannot be undone.</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={mutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Destination'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
        {mutation.error && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{(mutation.error as Error).message}</p>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteDestinationDialog
