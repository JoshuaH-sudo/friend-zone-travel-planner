'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimezoneData {
  city: string;
  country: string;
  timezone: string;
  offset: number; // In milliseconds
  color: string;
}

interface TimezoneComparisonProps {
  timezones: TimezoneData[];
  baseTimezone: TimezoneData;
  startDate?: Date;
}

export function TimezoneComparison({
  timezones,
  baseTimezone,
  startDate = new Date(),
}: TimezoneComparisonProps) {
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
  const formatOffset = (offsetMs: number) => {
    const offsetHours = Math.floor(Math.abs(offsetMs) / (60 * 60 * 1000));
    const offsetMinutes = Math.floor(
      (Math.abs(offsetMs) % (60 * 60 * 1000)) / (60 * 1000)
    );

    const sign = offsetMs >= 0 ? '+' : '-';

    if (offsetMinutes === 0) {
      return `${sign}${offsetHours}`;
    } else {
      return `${sign}${offsetHours}:${offsetMinutes.toString().padStart(2, '0')}`;
    }
  };

  // Calculate hours based on timezone offset differences
  const getHoursForTimezone = (timezone: TimezoneData, date: Date) => {
    const baseHours = [];
    const offsetDiffMs = timezone.offset - baseTimezone.offset;

    // Set midnight in base timezone as reference point
    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);

    // Generate 24 hours
    for (let i = 0; i < 24; i++) {
      // Calculate the exact time in this timezone
      const hourInBaseDateMs = baseDate.getTime() + i * 60 * 60 * 1000;
      const hourInTimezoneDateMs = hourInBaseDateMs + offsetDiffMs;
      const hourInTimezoneDate = new Date(hourInTimezoneDateMs);

      // Get hour, day offset
      const hourInTimezone = hourInTimezoneDate.getHours();

      // Calculate day offset by comparing dates
      const baseDayStart = new Date(date);
      baseDayStart.setHours(0, 0, 0, 0);

      const timezoneDayStart = new Date(hourInTimezoneDate);
      timezoneDayStart.setHours(0, 0, 0, 0);

      const dayOffsetMs = timezoneDayStart.getTime() - baseDayStart.getTime();
      const dayOffset = dayOffsetMs / (24 * 60 * 60 * 1000);

      // Determine if it's day or night (simple implementation: 6am-6pm is day)
      const isDaytime = hourInTimezone >= 6 && hourInTimezone < 18;

      // Convert from 0-23 format to 1-24 format
      const displayHour = hourInTimezone === 0 ? 24 : hourInTimezone + 1;

      baseHours.push({
        hour: displayHour.toString().padStart(2, '0'),
        hourValue: hourInTimezone, // Keep original 0-23 value for calculations
        isDaytime,
        dayOffset,
        hourDate: new Date(hourInTimezoneDate),
        // For hour 1, mark it as day start for alignment purposes
        isDayStart: displayHour === 1,
      });
    }

    return baseHours;
  };

  // Modify the day name determination to align with hour 01
  const getDayNameForTimezone = (timezone: TimezoneData, date: Date) => {
    const hours = getHoursForTimezone(timezone, date);

    // Find the hour that represents "01" (start of day)
    const dayStartHour = hours.find((h) => h.hour === '01');

    if (dayStartHour) {
      return getDayName(dayStartHour.hourDate);
    }

    return getDayName(date);
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

  // Function to adjust color saturation based on daytime or nighttime
  const adjustColorSaturation = (baseColor: string, isDaytime: boolean): string => {
    // Example logic: Adjust the brightness of the base color
    return isDaytime ? lightenColor(baseColor, 0.05) : darkenColor(baseColor, 0.05);
  };

  // Helper function to lighten a color
  const lightenColor = (color: string, amount: number): string => {
    const [r, g, b] = hexToRgb(color);
    return rgbToHex(
      Math.min(255, Math.floor(r + 255 * amount)),
      Math.min(255, Math.floor(g + 255 * amount)),
      Math.min(255, Math.floor(b + 255 * amount))
    );
  };

  // Helper function to darken a color
  const darkenColor = (color: string, amount: number): string => {
    const [r, g, b] = hexToRgb(color);
    return rgbToHex(
      Math.max(0, Math.floor(r - 255 * amount)),
      Math.max(0, Math.floor(g - 255 * amount)),
      Math.max(0, Math.floor(b - 255 * amount))
    );
  };

  // Convert hex color to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  };

  // Convert RGB to hex color
  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  // Combine base timezone and other timezones for display
  const allTimezones = [baseTimezone, ...timezones];

  return (
    <div className='mx-auto w-full max-w-4xl overflow-hidden rounded-lg bg-muted p-2 shadow-md'>
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
        {allTimezones.map((timezone, index) => {
          const hours = getHoursForTimezone(timezone, currentDate);
          const dayName = getDayNameForTimezone(timezone, currentDate);

          // Calculate unique displayed hours
          const displayedHours = [];
          const currentDayOffset = hours[0].dayOffset;
          let currentMonthDay = '';

          for (let i = 0; i < hours.length; i++) {
            const hour = hours[i];

            // When day changes, add the date info
            if (i > 0 && hour.dayOffset !== hours[i - 1].dayOffset) {
              currentMonthDay = getMonthDay(hour.hourDate);

              displayedHours.push({
                type: 'date',
                value: currentMonthDay,
              });
            }

            // When we reach hour "01", we want to include the day name
            if (hour.hour === '01') {
              displayedHours.push({
                type: 'dayname',
                value: getDayName(hour.hourDate),
              });
            }

            displayedHours.push({
              type: 'hour',
              value: hour.hour,
              isDaytime: hour.isDaytime,
            });
          }

          return (
            <div key={timezone.city} className='flex border-t'>
              {/* Left sidebar with timezone info - increased width */}
              <div className='w-52 flex-none border-r bg-card'>
                <div className='flex h-full items-center p-4'>
                  <div className='flex items-center gap-3'>
                    <span className='w-10 text-right font-medium text-gray-500'>
                      {formatOffset(timezone.offset)}
                    </span>
                    <div>
                      <div className='truncate text-lg font-bold'>
                        {timezone.city}
                      </div>
                      <div className='text-gray-500'>{timezone.country}</div>
                      {index === 0 && (
                        <div className='mt-1 text-xs font-medium text-gray-600'>
                          Base Timezone
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side with hours */}
              <div className='flex-1'>
                <div className='flex'>
                  {displayedHours.map((item, hourIndex) => {
                    if (item.type === 'date') {
                      return (
                        <div
                          key={`date-${hourIndex}`}
                          className={cn(
                            'flex h-12 min-w-16 items-center justify-center border-b border-l',
                            // `bg-${timezone.color}-500`,
                            'text-white' // Date cells always use white text
                          )}
                          style={{
                            backgroundColor: timezone.color,
                          }}
                        >
                          <div className='text-base font-medium'>
                            {item.value}
                          </div>
                        </div>
                      );
                    }

                    if (item.type === 'dayname') {
                      return (
                        <div
                          key={`dayname-${hourIndex}`}
                          className={cn(
                            'flex h-12 min-w-16 items-center justify-center border-b border-l',
                            'bg-gray-100'
                          )}
                        >
                          <div className='text-base font-medium'>
                            {item.value}
                          </div>
                        </div>
                      );
                    }

                    // Parse the hour for determining color
                    const hourNum = Number.parseInt(item.value, 10);

                    // Adjust for 1-24 format
                    const adjustedHour = hourNum === 24 ? 0 : hourNum - 1;

                    // Day is 6-18 in 0-23 format, which is 7-19 in 1-24 format
                    const isDaytime = adjustedHour >= 6 && adjustedHour < 18;

                    // Adjust the background color based on daytime or nighttime
                    const adjustedColor = adjustColorSaturation(timezone.color, isDaytime);

                    // Determine text color based on background intensity
                    const textColorClass = getTextColorForBackground(isDaytime ? '400' : '800');

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
                          {item.value}
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
