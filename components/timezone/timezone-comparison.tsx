'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Friend } from '@/lib/types';
import { secondsToHours } from 'date-fns';
import { TZDate } from '@date-fns/tz';
import { HourData, TimezoneHour } from './timezone-hour';

export interface TimezoneData {
  city: string;
  country: string;
  timezone: string;
  timezoneId: string;
  offset: number; // In milliseconds
  color: string;
}

interface TimezoneComparisonProps {
  friends: Friend[];
  startDate?: Date;
}

export function TimezoneComparison({
  friends,
  startDate = new Date(),
}: TimezoneComparisonProps) {
  const timezones: TimezoneData[] = friends.map((friend) => ({
    city: friend.timezone,
    country: friend.address,
    timezone: friend.timezone,
    timezoneId: friend.timeZoneId,
    offset: friend.timezoneOffset,
    color: friend.color,
  }));

  const [currentDate, setCurrentDate] = useState<Date>(startDate);

  const goToNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const goToPreviousDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setCurrentDate(prevDay);
  };

  // Get month and day (April 5)
  const getMonthDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format offset from milliseconds to human-readable format (+8)
  const formatOffset = (timezoneOffset: number) => {
    const timezoneOffsetHours = secondsToHours(timezoneOffset);
    return `(UTC${timezoneOffsetHours >= 0 ? '+' : ''}${timezoneOffsetHours})`;
  };

  // Calculate hours based on timezone offset differences
  const getHoursForTimezone = (friend: Friend, selectedDate: Date) => {
    const today = new Date();
    const baseHours: HourData[] = [];

    // Set midnight in UTC as reference point
    const utcDate = new TZDate(selectedDate, 'UTC');
    utcDate.setUTCHours(0, 0, 0, 0);

    const timezoneDate = new TZDate(selectedDate, friend.timeZoneId);
    timezoneDate.setUTCHours(0, 0, 0, 0);

    // Generate 24 hours
    for (let i = 0; i < 24; i++) {
      timezoneDate.setUTCHours(i);
      let hour = timezoneDate.getHours();
      if (hour === 0) {
        hour = 24;
      }
      const monthDay = getMonthDay(timezoneDate);

      // Translate today and the current timezone to a common date to compare
      const inCurrentDay = timezoneDate.getUTCDate() === today.getUTCDate();
      const inCurrentHour = timezoneDate.getUTCHours() === today.getUTCHours();
      const inCurrentMonth = timezoneDate.getUTCMonth() === today.getUTCMonth();
      const inCurrentYear =
        timezoneDate.getUTCFullYear() === today.getUTCFullYear();
      const shouldHighlightHour =
        inCurrentHour && inCurrentDay && inCurrentMonth && inCurrentYear;

      baseHours.push({
        hour,
        monthDay,
        date: timezoneDate.toString(),
        shouldHighlightHour,
      });
    }

    return baseHours;
  };

  return (
    <div className='mx-auto w-full overflow-hidden rounded-lg bg-muted p-2 shadow-md'>
      <div className='flex items-center justify-between border-b bg-card p-4'>
        <button
          onClick={goToPreviousDay}
          className='rounded-full p-2 hover:bg-gray-100'
        >
          <ChevronLeft className='h-5 w-5' />
        </button>
        <div className='flex items-center gap-2'>
          <Home className='h-5 w-5' />
          <span className='font-medium'>Timezone Comparison</span>
        </div>
        <button
          onClick={goToNextDay}
          className='rounded-full p-2 hover:bg-gray-100'
        >
          <ChevronRight className='h-5 w-5' />
        </button>
      </div>

      <div>
        {friends.map((friend) => {
          const hours = getHoursForTimezone(friend, currentDate);
          return (
            <div key={friend.id} className='flex items-center border-t'>
              {/* Left sidebar with timezone info - increased width */}
              <div className='w-52 flex-none border-r bg-card'>
                <div className='flex h-full justify-between gap-3 p-6'>
                  <div className='truncate text-lg font-bold capitalize'>
                    {friend.name}
                  </div>
                  <div className='w-20 flex items-start flex-col gap-1 text-xs'>
                    <p className='text-gray-500 capitalize truncate'>
                      {friend.address}
                    </p>
                    <p className=' text-gray-500 truncate'>
                      {friend.timeZoneId}
                    </p>
                    <p className='font-medium text-gray-500'>
                      {formatOffset(friend.timezoneOffset)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side with hours */}
              <div className='flex overflow-x-auto'>
                <TimezoneHour hours={hours} timezoneColor={friend.color} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
