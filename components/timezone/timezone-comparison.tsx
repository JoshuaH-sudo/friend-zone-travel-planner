'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Share2 } from 'lucide-react';
import { Friend } from '@/lib/types';
import { format, secondsToHours } from 'date-fns';
import { TZDate } from '@date-fns/tz';
import { HourData, TimezoneHour } from './timezone-hour';
import { Card, CardHeader, CardTitle } from '../ui/card';

import {
  captureElementAsImage,
  copyImageToClipboard,
  downloadImage,
} from '@/lib/image-capture';
import { Button } from '../ui/button';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations();
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

  const shareTimezoneComparison = async () => {
    if (!containerRef.current) return;

    const { dataUrl, dataBlob } = await captureElementAsImage(
      containerRef.current
    );
    await copyImageToClipboard(dataBlob);
  };

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-1'>
            <Clock className='h-4 w-4' />
            <span className='font-medium'>Timezone Comparison</span>
          </CardTitle>

          <Button
            variant='outline'
            size='sm'
            className='gap-2'
            onClick={shareTimezoneComparison}
          >
            <Share2 className='h-4 w-4' />
            {t('sharing.share')}
          </Button>
        </div>
      </CardHeader>

      <div className='flex items-center justify-between'>
        <button
          onClick={goToPreviousDay}
          className='rounded-full p-2 hover:bg-gray-100'
        >
          <ChevronLeft className='h-5 w-5' />
        </button>
        <div className='flex items-center gap-2'>
          <span className='font-medium'>{format(currentDate, 'PPP')}</span>
        </div>
        <button
          onClick={goToNextDay}
          className='rounded-full p-2 hover:bg-gray-100'
        >
          <ChevronRight className='h-5 w-5' />
        </button>
      </div>

      <div id='sharing-frame' ref={containerRef} className='bg-background p-3'>
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
      </div>
    </Card>
  );
}
