'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Friend } from '@/lib/types';
import { format, secondsToHours } from 'date-fns';
import { TZDate } from '@date-fns/tz';
import { HourData, TimezoneHour } from './timezone-hour';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

import { Button } from '../ui/button';
import { useTranslations } from 'next-intl';
import { ShareDialog } from '../social-share/share-dialog';
import useGetDateLocale from '../hooks/useGetDateLocale';

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
  const t = useTranslations('timezoneComparison');
  const dateLocale = useGetDateLocale();
  const containerRef = useRef(null);
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
    // return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return format(date, 'MMM d', {
      locale: dateLocale,
    });
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
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-1'>
            <Clock className='h-4 w-4' />
            <span className='font-medium'>{t('title')}</span>
          </CardTitle>

          <div className='flex gap-2'>
            <ShareDialog
              elementRef={containerRef}
              filename={`timezone-comparison-${format(
                currentDate,
                'yyyy-MM-dd',
                {
                  locale: dateLocale,
                }
              )}`}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className='bg-card p-3' ref={containerRef}>
        <div className='mb-4 flex items-center justify-between'>
          <Button variant='ghost' size='icon' onClick={goToPreviousDay}>
            <ChevronLeft className='h-4 w-4' />
            <span className='sr-only'>Previous day</span>
          </Button>
          <h3 className='font-medium'>
            {format(currentDate, 'PPP', {
              locale: dateLocale,
            })}
          </h3>
          <Button variant='ghost' size='icon' onClick={goToNextDay}>
            <ChevronRight className='h-4 w-4' />
            <span className='sr-only'>Next day</span>
          </Button>
        </div>

        <div id='timezone-list' className='rounded-md border bg-background'>
          {friends.map((friend) => {
            const hours = getHoursForTimezone(friend, currentDate);
            return (
              <div key={friend.id} className='flex items-center border-t'>
                {/* Left sidebar with timezone info - increased width */}
                <div className='w-64 flex-none border-r'>
                  <div className='flex h-full justify-between gap-3 p-6'>
                    <div className='truncate text-lg font-bold capitalize'>
                      {friend.name}
                    </div>
                    <div className='flex w-20 flex-col items-start gap-1 text-xs'>
                      <p className='truncate capitalize text-gray-500'>
                        {friend.address}
                      </p>
                      <p className='truncate text-gray-500'>
                        {friend.timeZoneId}
                      </p>
                      <p className='font-medium text-gray-500'>
                        {formatOffset(friend.timezoneOffset)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side with hours */}
                <div className='flex w-full overflow-x-auto'>
                  <TimezoneHour hours={hours} timezoneColor={friend.color} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
