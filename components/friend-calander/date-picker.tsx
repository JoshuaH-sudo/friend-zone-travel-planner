'use client';
import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '../ui/calander';
import useGetDateLocale from '../hooks/useGetDateLocale';
import { useTranslations } from 'next-intl';

interface DatePickerProps {
  selectedDate?: Date;
  defaultMonth?: Date;
  onDateChange: (date?: Date) => void;
}

export function DatePicker({
  selectedDate,
  defaultMonth,
  onDateChange,
}: DatePickerProps) {
  const t = useTranslations('friendCalendar.hours');
  const dateLocale = useGetDateLocale();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[240px] justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground'
          )}
        >
          <CalendarIcon />
          {selectedDate ? (
            format(selectedDate, 'PPP', {
              locale: dateLocale,
            })
          ) : (
            <span>{t('pickDate')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          locale={dateLocale}
          selected={selectedDate}
          defaultMonth={defaultMonth}
          onSelect={onDateChange}
        />
      </PopoverContent>
    </Popover>
  );
}
