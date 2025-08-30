'use client';

import * as React from 'react';
import { DatePickerWithRange } from '@/components/ui/datePickerWithRange';
import { DateRange } from 'react-day-picker';
import { differenceInDays, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangeInputProps {
  className?: string;
  dates?: DateRange ;
  onSelect: (dates?: DateRange) => void;
  label?: string;
}

export function DateRangeInput({
  className,
  dates,
  onSelect,
  label = 'Date Range',
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
      <div className="flex flex-col">
        <span className="text-sm font-medium mb-1">{label}</span>
        <DatePickerWithRange dates={dates} onSelect={onSelect} />
        {daysInRange > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {daysInRange} {daysInRange === 1 ? 'day' : 'days'} total
            {dates?.from && dates?.to && (
              <> ({format(dates.from, 'MMM d')} - {format(dates.to, 'MMM d, yyyy')})</>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

