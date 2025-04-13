'use client';

import { adjustColorSaturation, cn, darkenColor, lightenColor } from '@/lib/utils';

export interface HourData {
  hour: number;
  monthDay: string;
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
        const { hour, shouldHighlightHour, monthDay } = hourData;
        const isDaytime = hour >= 6 && hour < 18;

        const adjustedColor = adjustColorSaturation(timezoneColor, isDaytime);
        const borderColor = darkenColor(timezoneColor, 0.3);
        const highlightColour = lightenColor(timezoneColor, 0.3);

        const textColorClass = getTextColorForBackground(
          isDaytime ? '400' : '800'
        );

        let roundedClass = hour === 23 ? 'rounded-r-lg mr-0.5 border-r-2' : '';
        roundedClass = hour === 24 ? 'rounded-l-lg ml-0.5 border-l-2' : roundedClass;

        return (
          <div
            key={`hour-${hourIndex}`}
            className={cn(
              'flex h-14 w-14 items-center justify-center border-y-2 p-2 text-center text-sm font-medium',
              textColorClass,
              roundedClass
            )}
            style={{
              backgroundColor: shouldHighlightHour ? highlightColour : adjustedColor,
              borderColor,
            }}
          >
            <p>{hour === 24 ? monthDay : hour}</p>
          </div>
        );
      })}
    </>
  );
}
