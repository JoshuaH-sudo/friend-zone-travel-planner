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
import deleteFriend from '../actions/deleteFriend'
import { Friend } from '../hooks/useGetFriends'

interface DeleteFriendDialogProps {
  friend: Friend | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DeleteFriendDialog = ({ friend, open, onOpenChange }: DeleteFriendDialogProps) => {
  const queryClient = useQueryClient()

  const deleteFriendMutation = useMutation({
    mutationFn: deleteFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      onOpenChange(false)
    },
    onError: (error) => {
      console.error('Error deleting friend:', error)
    },
  })

  const handleDelete = () => {
    if (friend) {
      deleteFriendMutation.mutate(friend.id)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Friend</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{friend?.name}</strong>?
            {friend && (
              <div className="mt-2 text-sm text-muted-foreground">
                Location: {friend.location}
              </div>
            )}
            <div className="mt-2 text-sm text-red-600">
              This action cannot be undone.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteFriendMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteFriendMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteFriendMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              'Delete Friend'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
        
        {deleteFriendMutation.error && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              {deleteFriendMutation.error.message}
            </p>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteFriendDialog

