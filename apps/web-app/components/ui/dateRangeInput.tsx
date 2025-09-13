'use client';

import * as React from 'react';
import { DatePickerWithRange } from '@/components/ui/datePickerWithRange';
import { DateRange, DayPickerProps } from 'react-day-picker';
import { differenceInDays, formatDistance } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangeInputProps {
  className?: string;
  dates?: DateRange;
  onSelect: (dates?: DateRange) => void;
  label?: string;
  calendarProps?: DayPickerProps;
}

export function DateRangeInput({
  className,
  dates,
  onSelect,
  label,
  calendarProps,
}: DateRangeInputProps) {
  // Calculate the number of days in the range
  const daysInRange = React.useMemo(() => {
    if (dates?.from && dates?.to) {
      return differenceInDays(dates.to, dates.from) + 1;
    }
    return 0;
  }, [dates]);

  return (
    <div className={cn('grid gap-1', className)}>
      <div className='flex flex-col'>
        <span
          className={cn('mb-1 text-sm font-medium', {
            hidden: !label,
          })}
        >
          {label}
        </span>
        <DatePickerWithRange
          dates={dates}
          onSelect={onSelect}
          calendarProps={calendarProps}
        />
        {daysInRange > 0 && dates?.from && dates?.to && (
          <p className='text-muted-foreground mt-1 text-xs'>
            {formatDistance(dates.from, dates.to)}
          </p>
        )}
      </div>
    </div>
  );
}
