'use client';

import { useRef, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isSameMonth,
} from 'date-fns';
import type { Friend } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Camera, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { SocialShare } from './social-share';
import { useTranslations } from 'next-intl';

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

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getAvailableFriends = (date: Date) => {
    return friends.filter((friend) =>
      friend.availableDates.some((d) => isSameDay(d, date))
    );
  };

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle>{t('navigation.overview')}</CardTitle>
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
      <CardContent className='p-3 bg-card' ref={calendarRef}>
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

        <div className='grid grid-cols-7 gap-1 text-center'>
          {weekdays.map((day) => (
            <div
              key={day}
              className='py-1 text-xs font-medium text-muted-foreground'
            >
              {day}
            </div>
          ))}

          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-start-${i}`} className='h-24 md:h-28' />
          ))}

          {monthDays.map((day) => {
            const availableFriends = getAvailableFriends(day);
            const availableCount = availableFriends.length;
            const allAvailable =
              availableCount === friends.length && friends.length > 0;

            return (
              <TooltipProvider key={day.toString()}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'flex h-24 flex-col rounded-md border p-1 md:h-28',
                        !isSameMonth(day, currentMonth) && 'opacity-50',
                        allAvailable &&
                          'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                      )}
                    >
                      <div className='self-end text-sm font-medium'>
                        {format(day, 'd')}
                      </div>

                      {availableCount > 0 && (
                        <div className='mt-auto flex flex-wrap justify-center gap-1'>
                          {availableCount === friends.length &&
                          friends.length > 0 ? (
                            <Badge className='bg-green-500 hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500'>
                              Everyone
                            </Badge>
                          ) : (
                            <Badge variant='outline'>
                              {availableCount}/{friends.length}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Display friend names/initials */}
                      <div className='mt-1 flex flex-wrap justify-center gap-1 overflow-hidden'>
                        {availableFriends.slice(0, 3).map((friend) => (
                          <div
                            key={friend.id}
                            className='flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium text-white'
                            style={{ backgroundColor: friend.color }}
                            title={friend.name}
                          >
                            {getInitials(friend.name)}
                          </div>
                        ))}
                        {availableFriends.length > 3 && (
                          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium'>
                            +{availableFriends.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side='bottom' align='center'>
                    <div className='text-sm font-medium'>
                      {format(day, 'EEEE, MMMM d, yyyy')}
                    </div>
                    {availableCount > 0 ? (
                      <div className='mt-1'>
                        <div className='font-medium'>Available:</div>
                        <ul className='list-inside list-disc'>
                          {availableFriends.map((friend) => (
                            <li
                              key={friend.id}
                              className='flex items-center gap-1'
                            >
                              <span
                                className='inline-block h-2 w-2 rounded-full'
                                style={{ backgroundColor: friend.color }}
                              />
                              {friend.name}{' '}
                              <span className='text-xs text-muted-foreground'>
                                ({friend.timezone})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className='text-muted-foreground'>
                        No one is available
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
