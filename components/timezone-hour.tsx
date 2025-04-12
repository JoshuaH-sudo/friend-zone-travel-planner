'use client';

import { adjustColorSaturation, cn } from '@/lib/utils';

interface HourData {
  hour: number;
  date: string;
  shouldHighlightHour: boolean;
}

interface TimezoneHourProps {
  hours: HourData[];
  timezoneColor: string;
}

export function TimezoneHour({ hours, timezoneColor }: TimezoneHourProps) {
  const getTextColorForBackground = (intensity: string) => {
    if (intensity === '600' || intensity === '800') {
      return 'text-white';
    }
    return 'text-gray-800';
  };

  return (
    <>
      {hours.map((hourData, hourIndex) => {
        const { hour, shouldHighlightHour } = hourData;
        const isDaytime = hour >= 6 && hour < 18;

        const adjustedColor = adjustColorSaturation(
          timezoneColor,
          isDaytime
        );

        const textColorClass = getTextColorForBackground(
          isDaytime ? '400' : '800'
        );

        return (
          <div
            key={`hour-${hourIndex}`}
            className='flex h-14 min-w-14 items-center justify-center border-b border-l'
            style={{
              backgroundColor: shouldHighlightHour ? 'red' : adjustedColor,
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
    </>
  );
}
