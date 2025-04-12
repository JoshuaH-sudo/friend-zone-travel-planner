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

  // Get day name (Monday, Tuesday, etc.)
  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
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

  // Calculate hours based on timezone offset differences
  const getHoursForTimezone = (timezoneData: TimezoneData, date: Date) => {
    const baseHours = [];

    // Set midnight in UTC as reference point
    const utcDate = new TZDate(date, 'UTC');
    utcDate.setUTCHours(0, 0, 0, 0);
    const timezoneDate = new TZDate(date, timezoneData.timezoneId);
    timezoneDate.setUTCHours(0, 0, 0, 0);

    console.log("utcDate", utcDate.toString());
    console.log("timezoneDate", timezoneDate.toString());

    // Generate 24 hours
    for (let i = 0; i < 24; i++) {
      timezoneDate.setUTCHours(i);

      baseHours.push(timezoneDate.getHours());
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
    return 'text-black';
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
            <div key={timezone.city} className='flex border-t'>
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
              <div className='flex-1'>
                <div className='flex'>
                  {hours.map((hour, hourIndex) => {
                    // Day is 6-18 in 0-23 format, which is 7-19 in 1-24 format
                    const isDaytime = hour >= 6 && hour < 18;

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
                        className='flex h-12 min-w-14 items-center justify-center border-b border-l'
                        style={{
                          backgroundColor: adjustedColor,
                        }}
                      >
                        <div
                          className={cn('text-lg font-medium', textColorClass)}
                        >
                          {hour}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
