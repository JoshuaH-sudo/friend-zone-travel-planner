'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { adjustColorSaturation, cn } from '@/lib/utils';
import { Friend } from '@/lib/types';
import { secondsToHours } from 'date-fns';
import { TZDate } from '@date-fns/tz';

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

  console.log(timezones);
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
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  // Format offset from milliseconds to human-readable format (+8:30)
  const formatOffset = (timezoneOffset: number) => {
    const timezoneOffsetHours = secondsToHours(timezoneOffset);
    return `(UTC${timezoneOffsetHours >= 0 ? '+' : ''}${timezoneOffsetHours})`;
  };

  interface HoursData {
    hour: number;
    monthDay: string;
    date: string;
    shouldHighlightHour: boolean;
  }

  // Calculate hours based on timezone offset differences
  const getHoursForTimezone = (timezoneData: TimezoneData, selectedDate: Date) => {
    const today = new Date();
    const baseHours: HoursData[] = [];

    // Set midnight in UTC as reference point
    const utcDate = new TZDate(selectedDate, 'UTC');
    utcDate.setUTCHours(0, 0, 0, 0);

    const timezoneDate = new TZDate(selectedDate, timezoneData.timezoneId);
    timezoneDate.setUTCHours(0, 0, 0, 0);

    // Generate 24 hours
    for (let i = 0; i < 24; i++) {
      timezoneDate.setUTCHours(i);
      const hour = timezoneDate.getHours();
      const monthDay = getMonthDay(timezoneDate);

      const inCurrentDay = timezoneDate.getDate() === today.getDate();
      const inCurrentHour = timezoneDate.getHours() === today.getHours();
      const inCurrentMonth = timezoneDate.getMonth() === today.getMonth();
      const inCurrentYear =
        timezoneDate.getFullYear() === today.getFullYear();
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

  // Determine text color based on background color intensity
  const getTextColorForBackground = (intensity: string) => {
    // For darker shades (600, 800), use white text
    if (intensity === '600' || intensity === '800') {
      return 'text-white';
    }
    // For lighter shades (300, 400, 500), use black text
    return 'text-gray-800';
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

      <div className='overflow-x-auto'>
        {timezones.map((timezone) => {
          const hours = getHoursForTimezone(timezone, currentDate);
          return (
            <div key={timezone.city} className='flex items-center border-t'>
              {/* Left sidebar with timezone info - increased width */}
              <div className='w-52 flex-none border-r bg-card'>
                <div className='flex h-full items-center p-4'>
                  <div className='gap-3'>
                    <div>
                      <div className='truncate text-lg font-bold'>
                        {timezone.country}
                      </div>
                      {/* <div className='text-gray-500'>{timezone.country}</div> */}
                    </div>
                    <span className='w-10 text-right font-medium text-gray-500'>
                      {formatOffset(timezone.offset)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side with hours */}
              <div className='flex'>
                {hours.map((hourData, hourIndex) => {
                  const { hour, date, shouldHighlightHour } = hourData;
                  // Day is 6-18 in 0-23 format, which is 7-19 in 1-24 format
                  const isDaytime =
                    typeof hourData === 'string'
                      ? false
                      : hour >= 6 && hour < 18;

                  // Adjust the background color based on daytime or nighttime
                  const adjustedColor = adjustColorSaturation(
                    timezone.color,
                    isDaytime
                  );

                  // Determine text color based on background intensity
                  const textColorClass = getTextColorForBackground(
                    isDaytime ? '400' : '800'
                  );

                  return (
                    <div
                      key={`hour-${hourIndex}`}
                      className='flex h-14 min-w-14 items-center justify-center border-b border-l'
                      style={{
                        backgroundColor: shouldHighlightHour
                          ? 'red'
                          : adjustedColor,
                      }}
                    >
                      <div
                        className={cn(
                          'p-2 text-center text-lg font-medium',
                          textColorClass
                        )}
                      >
                        {hour}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
