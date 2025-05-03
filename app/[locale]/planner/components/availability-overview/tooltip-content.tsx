import { format } from 'date-fns';
import type { Friend } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface TooltipContentProps {
  day: Date;
  availableFriends: Friend[];
}

export function AvailabilityTooltipContent({
  day,
  availableFriends,
}: TooltipContentProps) {
  const t = useTranslations('availabilityOverview');
  return (
    <>
      <div className='text-sm font-medium'>
        {format(day, 'EEEE, MMMM d, yyyy')}
      </div>
      {availableFriends.length > 0 ? (
        <div className='mt-1'>
          <div className='font-medium'>Available:</div>
          <ul className='list-inside list-disc'>
            {availableFriends.map((friend) => {
              const weekdayAvailability = friend.availableHours.weekdays;
              const weekendAvailability = friend.availableHours.weekends;
              const isWeekday = day.getDay() === 0 || day.getDay() === 6;
              const dateHourAvailability = friend.availableHours.dates[day.toISOString()]
              let availabilityDisplay = [1,24];
              if (isWeekday) {
                availabilityDisplay = weekdayAvailability
              } else {
                availabilityDisplay = weekendAvailability
              }

              if (dateHourAvailability) {
                availabilityDisplay = dateHourAvailability
              }
              const startHour = availabilityDisplay[0];
              const endHour = availabilityDisplay[1];
              const isAllDay = startHour === 1 && endHour === 24;
              return (
                <li key={friend.id} className='flex items-center gap-1'>
                  <span
                    className='inline-block h-2 w-2 rounded-full'
                    style={{ backgroundColor: friend.color }}
                  />
                  {friend.name}{' '}
                  <span className='text-xs text-muted-foreground'>
                    ({friend.timezone})
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    { isAllDay ? t('allDay'): `${startHour}:00 - ${endHour}:00`}
                    </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className='text-muted-foreground'>No one is available</div>
      )}
    </>
  );
}
