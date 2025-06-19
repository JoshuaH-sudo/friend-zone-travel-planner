'use client';

import { format, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { FriendAvatars } from './friend-avatars';
import type { Friend } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface DayCellProps {
  day: Date;
  currentMonth: Date;
  availableFriends: Friend[];
  totalFriends: number;
}

export function DayCell({ day, currentMonth, availableFriends, totalFriends }: DayCellProps) {
  const t = useTranslations('availabilityOverview');
  const availableCount = availableFriends.length;
  const allAvailable = availableCount === totalFriends && totalFriends > 0;

  return (
    <div
      className={cn(
        'flex h-24 flex-col rounded-md border p-1 md:h-28',
        !isSameMonth(day, currentMonth) && 'opacity-50',
        allAvailable &&
          'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
      )}
    >
      <div className='self-end text-sm font-medium'>
        {format(day, 'd')}
      </div>

      {availableCount > 0 && (
        <div className='mt-auto flex flex-wrap justify-center gap-1'>
          {availableCount === totalFriends && totalFriends > 0 ? (
            <Badge className='bg-green-500 hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500'>
              {t('everyone')}
            </Badge>
          ) : (
            <Badge variant='outline'>
              {availableCount}/{totalFriends}
            </Badge>
          )}
        </div>
      )}

      {/* Display friend avatars */}
      <FriendAvatars friends={availableFriends} />
    </div>
  );
}
