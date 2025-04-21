'use client';

import { useState, useRef } from 'react';
import type { AvailableHours, Friend } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Trash2,
  Globe,
  Upload,
  Edit,
  Clock,
  CalendarRange,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { generateFriendIcal, downloadFile } from '@/lib/ical';
import { EditFriendForm } from '../edit-friend-form';
import { useTranslations } from 'next-intl';
import { OnSelectHandler } from 'react-day-picker';
import { Calendar } from '../ui/calander';
import { cn } from '@/lib/utils';
import { displayTimezoneOffset } from '../timezone/timezone-display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TimeRangeSlider } from '../timerange-slider';

interface FriendCalendarProps {
  friend: Friend;
  friends: Friend[];
  onUpdateAvailableDates: (friendId: string, dates: Date[]) => void;
  onUpdateAvailableHours: (
    friendId: string,
    availableHours: Partial<AvailableHours>
  ) => void;
  onRemoveFriend: (friendId: string) => void;
  onUpdateFriend: (updatedFriend: Friend) => void;
}

export function FriendCalendar({
  friend,
  friends,
  onUpdateAvailableDates,
  onUpdateAvailableHours,
  onRemoveFriend,
  onUpdateFriend,
}: FriendCalendarProps) {
  const t = useTranslations();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const exportCalendar = () => {
    const icalContent = generateFriendIcal(friend);
    const filename = `${friend.name.replace(/\s+/g, '_')}_availability.ics`;
    downloadFile(icalContent, filename);
  };

  const handleSaveEdit = (updatedFriend: Friend) => {
    onUpdateFriend(updatedFriend);
    setShowEditDialog(false);
  };

  const onDaySelect: OnSelectHandler<Date[] | undefined> = (dates?: Date[]) => {
    if (!dates) return;
    onUpdateAvailableDates(friend.id, dates);
  };

  const { timezone, timezoneOffset } = friend;

  const timezoneDisplayText = displayTimezoneOffset(timezone, timezoneOffset);
  return (
    <Card className='flex h-[500px] flex-col overflow-hidden'>
      <Tabs defaultValue='dates'>
        <CardHeader
          className='pb-2'
          style={{ backgroundColor: `${friend.color}20` }}
        >
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <span
                className='inline-block h-3 w-3 rounded-full'
                style={{ backgroundColor: friend.color }}
              />
              {friend.name}
            </CardTitle>

            <div className='flex items-center gap-1'>
              <TabsList className='grid grid-cols-2'>
                <TabsTrigger value='dates' className='flex items-center gap-2'>
                  <CalendarRange className='h-4 w-4' />
                  Dates
                  {/* {t('navigation.calendars')} */}
                </TabsTrigger>
                <TabsTrigger value='hours' className='flex items-center gap-2'>
                  <Clock className='h-4 w-4' />
                  Hours
                  {/* {t('navigation.timezone')} */}
                </TabsTrigger>
              </TabsList>

              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-muted-foreground hover:text-primary'
                    title={t('actions.edit')}
                  >
                    <Edit className='h-4 w-4' />
                    <span className='sr-only'>
                      {t('actions.edit')} {friend.name}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <h2 className='mb-4 text-xl font-bold'>
                    {t('actions.edit')} {friend.name}
                  </h2>
                  <EditFriendForm
                    friend={friend}
                    friends={friends}
                    onSave={handleSaveEdit}
                    onCancel={() => setShowEditDialog(false)}
                  />
                </DialogContent>
              </Dialog>

              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-muted-foreground hover:text-primary'
                onClick={exportCalendar}
                title={t('actions.export')}
              >
                <Upload className='h-4 w-4' />
                <span className='sr-only'>
                  {t('actions.export')} {friend.name}
                </span>
              </Button>

              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-muted-foreground hover:text-destructive'
                onClick={() => onRemoveFriend(friend.id)}
                title={t('actions.delete')}
              >
                <Trash2 className='h-4 w-4' />
                <span className='sr-only'>
                  {t('actions.delete')} {friend.name}
                </span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className='h-full grow p-3'>
          <TabsContent value='dates'>
            <div ref={calendarRef}>
              <Calendar
                required={false}
                mode='multiple'
                style={{ width: '100%' }}
                monthGridClassName='w-full'
                weekClassName='w-full'
                weekdayClassName='w-full'
                components={{
                  DayButton: ({ modifiers, className, ...props }) => (
                    <Button
                      className={cn(
                        'size-8 rounded-md p-0 font-normal transition-none hover:opacity-70',
                        className
                      )}
                      variant='ghost'
                      {...props}
                      style={{
                        backgroundColor: modifiers.selected
                          ? friend.color
                          : undefined,
                      }}
                    />
                  ),
                }}
                selected={friend.availableDates}
                onSelect={onDaySelect}
              />
            </div>
          </TabsContent>
          <TabsContent value='hours'>
            <TimeRangeSlider
              label='Mon - Fri'
              colour={friend.color}
              value={friend.availableHours.weekdays}
              onChange={(value) =>
                onUpdateAvailableHours(friend.id, {
                  weekdays: value,
                })
              }
            />
            <TimeRangeSlider
              label='Sat - Sun'
              colour={friend.color}
              value={friend.availableHours.weekends}
              onChange={(value) =>
                onUpdateAvailableHours(friend.id, {
                  weekends: value,
                })
              }
            />
          </TabsContent>
        </CardContent>

        <CardFooter className='flex flex-col items-start gap-2 px-3 pb-3 pt-0'>
          <div className='text-xs text-muted-foreground'>
            {t('friend.availableDays', { count: friend.availableDates.length })}
          </div>

          <div className='w-full'>
            <div className='mb-1 flex items-center gap-2'>
              <Globe className='h-3 w-3 text-muted-foreground' />
              <Label htmlFor={`timezone-${friend.id}`} className='text-xs'>
                {t('friend.timezone')}
              </Label>
            </div>
            <p className='text-xs text-muted-foreground'>
              {timezoneDisplayText}
            </p>
          </div>
        </CardFooter>
      </Tabs>
    </Card>
  );
}
