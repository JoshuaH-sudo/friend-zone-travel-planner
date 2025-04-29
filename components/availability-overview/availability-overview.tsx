'use client';

import { useRef, useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import type { Friend } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CalendarGrid } from './calendar-grid';
import { ShareDialog } from '../social-share/share-dialog';

interface AvailabilityOverviewProps {
  friends: Friend[];
  groupName?: string;
}

export function AvailabilityOverview({
  friends,
  groupName,
}: AvailabilityOverviewProps) {
  const t = useTranslations('availabilityOverview');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarRef = useRef<HTMLDivElement>(null);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-1'>
            <Users className='h-4 w-4' />
            {t('title')}
          </CardTitle>

          <div className='flex gap-2'>
            <ShareDialog elementRef={calendarRef} filename={groupName || t('title')} />
          </div>
        </div>
      </CardHeader>
      <CardContent className='bg-card p-3' ref={calendarRef}>
        <div className='mb-4 flex items-center justify-between'>
          <Button variant='ghost' size='icon' onClick={prevMonth}>
            <ChevronLeft className='h-4 w-4' />
            <span className='sr-only'>Previous month</span>
          </Button>
          <h3 className='font-medium'>{format(currentMonth, 'MMMM yyyy')}</h3>
          <Button variant='ghost' size='icon' onClick={nextMonth}>
            <ChevronRight className='h-4 w-4' />
            <span className='sr-only'>Next month</span>
          </Button>
        </div>

        <CalendarGrid currentMonth={currentMonth} friends={friends} />
      </CardContent>
    </Card>
  );
}
