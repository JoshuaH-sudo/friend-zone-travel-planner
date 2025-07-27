'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import EditFriendForm from './components/EditFriendForm';
import useGetFriendById from '../hooks/useGetFriendById';

const EditFriendPage = () => {
  const router = useRouter();
  const { friendId } = useParams<{ friendId: string }>();
  const { data: friend, isLoading, error } = useGetFriendById(friendId);

  const handleSuccess = () => {
    router.push('/dashboard/friends');
  };

  const handleCancel = () => {
    router.push('/dashboard/friends');
  };

  if (isLoading) {
    return (
      <main className='bg-background min-h-screen'>
        <div className='mx-auto max-w-4xl px-4 py-8'>
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
          </div>
        </div>
      </main>
    );
  }

  if (error || !friend) {
    return (
      <main className='bg-background min-h-screen'>
        <div className='mx-auto max-w-4xl px-4 py-8'>
          <div className='text-center'>
            <h1 className='text-foreground mb-4 text-2xl font-bold'>
              Friend Not Found
            </h1>
            <p className='text-muted-foreground mb-6'>
              The friend you're looking for doesn't exist or you don't have
              permission to edit them.
            </p>
            <Button onClick={() => router.push('/dashboard/friends')}>
              Back to Friends
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='bg-background min-h-screen'>
      <div className='mx-auto max-w-4xl px-4 py-8'>
        {/* Header */}
        <div className='mb-8 flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.push('/dashboard/friends')}
            className='gap-2'
          >
            <ArrowLeft className='h-4 w-4' />
            Back to Friends
          </Button>
          <div>
            <h1 className='text-foreground text-3xl font-bold'>Edit Friend</h1>
            <p className='text-muted-foreground'>
              Update {friend.name}'s information and location
            </p>
          </div>
        </div>

        {/* Edit Friend Form */}
        <EditFriendForm
          friend={friend}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </main>
  );
};

export default EditFriendPage;
