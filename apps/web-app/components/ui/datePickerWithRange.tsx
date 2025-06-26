'use client';

import * as React from 'react';
import { addDays, format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import useGetDateLocale from '@/app/[locale]/planner/hooks/useGetDateLocale';
import { useState } from 'react';

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const dateLocale = useGetDateLocale();
  const [dates, setDates] = useState<DateRange | undefined>({
    from: new Date(),
    // Default to a week range
    to: addDays(new Date(), 7),
  });

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
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
          className='w-auto bg-slate-500 p-1'
          align='start'
        >
          <Calendar
            initialFocus
            mode='range'
            locale={dateLocale}
            defaultMonth={dates?.from}
            selected={dates}
            onSelect={setDates}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
