'use client';

import { useRef, useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import type { Friend } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Share2, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { SocialShare } from '../social-share';
import { useTranslations } from 'next-intl';
import { CalendarGrid } from './calendar-grid';

interface AvailabilityOverviewProps {
  friends: Friend[];
  groupName?: string;
}

export function AvailabilityOverview({
  friends,
  groupName,
}: AvailabilityOverviewProps) {
  const t = useTranslations();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [showShareDialog, setShowShareDialog] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-1'>
            <Users className='h-4 w-4' />
            {t('navigation.overview')}
          </CardTitle>

          <div className='flex gap-2'>
            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm' className='gap-2'>
                  <Share2 className='h-4 w-4' />
                  {t('sharing.share')}
                </Button>
              </DialogTrigger>
              <DialogContent className='w-100'>
                <h2 className='mb-4 text-xl font-bold'>
                  {t('sharing.shareCalendar')}
                </h2>
                <SocialShare
                  elementRef={calendarRef}
                  filename={groupName || t('app.title')}
                />
              </DialogContent>
            </Dialog>
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
