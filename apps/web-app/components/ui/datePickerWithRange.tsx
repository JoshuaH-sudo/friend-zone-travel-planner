'use client';

import * as React from 'react';
import { addYears, format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange, DayPicker, DayPickerProps } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import useGetDateLocale from '@/lib/hooks/useGetDateLocale';

interface DatePickerWithRangeProps {
  className?: string;
  dates?: DateRange;
  onSelect: (dates?: DateRange) => void;
  calendarProps?: DayPickerProps
}

export function DatePickerWithRange({
  className,
  dates,
  onSelect: setDates,
  calendarProps,
}: DatePickerWithRangeProps) {
  const dateLocale = useGetDateLocale();

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal',
              !dates && 'text-muted-foreground'
            )}
          >
            <CalendarIcon />
            {dates?.from ? (
              dates.to ? (
                <>
                  {format(dates.from, 'LLL dd, y')} -{' '}
                  {format(dates.to, 'LLL dd, y')}
                </>
              ) : (
                format(dates.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          id='date-picker-content'
          className='bg-popover w-auto p-0'
          align='start'
          data-slot='popover-content'
        >
          <Calendar
            initialFocus
            mode='range'
            captionLayout='dropdown'
            startMonth={new Date()}
            endMonth={addYears(new Date(), 5)}
            locale={dateLocale}
            defaultMonth={dates?.from}
            numberOfMonths={1}
            {...calendarProps}
            selected={dates}
            onSelect={setDates}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
