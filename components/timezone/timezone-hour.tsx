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
  const getTextColorForBackground = (backgroundColor: string) => {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Calculate relative luminance using the WCAG formula
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
    // Use white text on dark backgrounds (luminance < 0.5) and black text on light backgrounds
    return luminance < 0.5 ? 'text-white' : 'text-gray-800';
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
          shouldHighlightHour ? highlightColour : adjustedColor
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
