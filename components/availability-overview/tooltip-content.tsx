import { format } from 'date-fns';
import type { Friend } from '@/lib/types';

interface TooltipContentProps {
  day: Date;
  availableFriends: Friend[];
}

export function AvailabilityTooltipContent({ day, availableFriends }: TooltipContentProps) {
  return (
    <>
      <div className='text-sm font-medium'>
        {format(day, 'EEEE, MMMM d, yyyy')}
      </div>
      {availableFriends.length > 0 ? (
        <div className='mt-1'>
          <div className='font-medium'>Available:</div>
          <ul className='list-inside list-disc'>
            {availableFriends.map((friend) => (
              <li
                key={friend.id}
                className='flex items-center gap-1'
              >
                <span
                  className='inline-block h-2 w-2 rounded-full'
                  style={{ backgroundColor: friend.color }}
                />
                {friend.name}{' '}
                <span className='text-xs text-muted-foreground'>
                  ({friend.timezone})
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className='text-muted-foreground'>
          No one is available
        </div>
      )}
    </>
  );
}
