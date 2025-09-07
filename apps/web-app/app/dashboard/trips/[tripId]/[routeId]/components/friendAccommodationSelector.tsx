'use client';

import { FC } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertCircle, Home, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useGetFriendsByGeoLocation from '../hooks/useGetFriendsByGeoLocation';

export interface Friend {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
}

export interface FriendAccommodationSelectorProps {
  selectedFriendId: string | null;
  coordinates: { lat: number; lng: number };
  onSelectFriend: (friendId: string, name: string, address: string) => void;
}

const FriendAccommodationSelector: FC<FriendAccommodationSelectorProps> = ({
  selectedFriendId,
  coordinates,
  onSelectFriend,
}) => {
  const {
    data: friends,
    isLoading,
    error,
    refetch,
  } = useGetFriendsByGeoLocation(coordinates);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-muted-foreground flex items-center gap-2'>
          <Loader2 className='h-4 w-4 animate-spin' />
          <span className='text-sm'>Finding friends nearby...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 py-8'>
        <div className='text-destructive flex items-center gap-2'>
          <AlertCircle className='h-4 w-4' />
          <span className='text-sm'>Failed to load friends</span>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => refetch()}
          className='text-xs'
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className='text-muted-foreground py-8 text-center'>
        <p className='text-sm'>No friends found near this location</p>
        <Button
          variant='outline'
          size='sm'
          onClick={() => refetch()}
          className='mt-2 text-xs'
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className='w-full'>
      <div className='space-y-2'>
        <h3 className='mb-2 text-sm font-medium'>
          Select a friend to stay with:
        </h3>
        <RadioGroup value={selectedFriendId || undefined} className='gap-2'>
          {friends.map((friend) => (
            <div key={friend.id} className='flex items-start space-x-2'>
              <RadioGroupItem
                value={friend.id}
                id={`friend-${friend.id}`}
                className='mt-1'
                onClick={() =>
                  onSelectFriend(friend.id, friend.name, friend.location)
                }
              />
              <Label
                htmlFor={`friend-${friend.id}`}
                className='flex-1 cursor-pointer'
              >
                <Card
                  className={`transition-shadow hover:shadow-md ${selectedFriendId === friend.id ? 'border-primary' : ''}`}
                >
                  <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                      <Home className='h-4 w-4' />
                      {friend.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <CardDescription className='flex items-center gap-1 text-xs'>
                      <MapPin className='h-3 w-3' />
                      {friend.location}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </ScrollArea>
  );
};

export default FriendAccommodationSelector;
