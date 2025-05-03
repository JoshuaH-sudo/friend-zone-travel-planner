'use client';

import type { Friend } from '@/lib/types';

interface FriendAvatarsProps {
  friends: Friend[];
}

export function FriendAvatars({ friends }: FriendAvatarsProps) {
  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className='mt-1 flex flex-wrap justify-center gap-1 overflow-hidden'>
      {friends.slice(0, 3).map((friend) => (
        <div
          key={friend.id}
          className='flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium text-white'
          style={{ backgroundColor: friend.color }}
          title={friend.name}
        >
          {getInitials(friend.name)}
        </div>
      ))}
      {friends.length > 3 && (
        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium'>
          +{friends.length - 3}
        </div>
      )}
    </div>
  );
}
