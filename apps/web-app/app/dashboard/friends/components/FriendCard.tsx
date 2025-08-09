'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MapPin, Edit, Trash2, Eye } from 'lucide-react';
import { Friend } from '../hooks/useGetFriends';

interface FriendCardProps {
  friend: Friend;
  onViewMap: (friend: Friend) => void;
  onEdit: (friend: Friend) => void;
  onDelete: (friend: Friend) => void;
  isMapVisible: boolean;
}

const FriendCard = ({
  friend,
  onViewMap,
  onEdit,
  onDelete,
  isMapVisible,
}: FriendCardProps) => {
  return (
    <Card
      onClick={() => onViewMap(friend)}
      className={`transition-all duration-200 hover:shadow-md ${isMapVisible ? 'ring-2 ring-blue-500' : ''}`}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <h3 className='text-foreground text-lg font-semibold'>
              {friend.name}
            </h3>
            <div className='text-muted-foreground mt-1 flex items-center text-sm'>
              <MapPin className='mr-1 h-4 w-4' />
              <span className='truncate'>{friend.location}</span>
            </div>
          </div>
          <div className='ml-2 flex items-center space-x-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onEdit(friend)}
              className='h-8 w-8 p-0'
              title='Edit friend'
            >
              <Edit className='text-muted-foreground h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onDelete(friend)}
              className='h-8 w-8 p-0 hover:text-red-600'
              title='Delete friend'
            >
              <Trash2 className='text-muted-foreground h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <div className='space-y-2'>
          {friend.destinations && (
            <div className='flex items-center rounded bg-blue-50 px-2 py-1 text-xs text-blue-600'>
              <MapPin className='mr-1 h-3 w-3' />
              <span>Linked to destination</span>
            </div>
          )}

          <div className='flex items-center justify-between pt-2'>
            <div className='text-muted-foreground text-xs'>
              Added {new Date(friend.created_at || '').toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendCard;
