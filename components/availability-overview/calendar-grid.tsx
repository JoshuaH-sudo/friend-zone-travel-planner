'use client';

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns';
import type { Friend } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';
import { DayCell } from './day-cell';
import { AvailabilityTooltipContent } from './tooltip-content';

interface CalendarGridProps {
  currentMonth: Date;
  friends: Friend[];
}

export function CalendarGrid({ currentMonth, friends }: CalendarGridProps) {
  const t = useTranslations();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getAvailableFriends = (date: Date) => {
    return friends.filter((friend) =>
      friend.availableDates.some((d) => isSameDay(d, date))
    );
  };

  return (
    <div>
      <div className='grid grid-cols-7 gap-1 text-center'>
        {weekdays.map((day) => (
          <div
            key={day}
            className='py-1 text-xs font-medium text-muted-foreground'
          >
            {day}
          </div>
        ))}

        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-start-${i}`} className='h-24 md:h-28' />
        ))}

        {monthDays.map((day) => {
          const availableFriends = getAvailableFriends(day);

          return (
            <TooltipProvider key={day.toString()}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DayCell
                    day={day}
                    currentMonth={currentMonth}
                    availableFriends={availableFriends}
                    totalFriends={friends.length}
                  />
                </TooltipTrigger>
                <TooltipContent side='bottom' align='center'>
                  <AvailabilityTooltipContent
                    day={day}
                    availableFriends={availableFriends}
                  />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}
