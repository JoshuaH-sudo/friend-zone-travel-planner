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
  CalendarIcon,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { generateFriendIcal, downloadFile } from '@/lib/ical';
import { EditFriendForm } from '../friend-form/edit-friend-form';
import { useLocale, useTranslations } from 'next-intl';
import { OnSelectHandler } from 'react-day-picker';
import { Calendar } from '../ui/calander';
import { cn } from '@/lib/utils';
import { displayTimezoneOffset } from '../timezone/timezone-display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TimeRangeSlider } from './timerange-slider';
import { DatePicker } from './date-picker';
import { format } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { dateLocaleMaps, SupportedLocales } from '@/i18n/utils';

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
  const t = useTranslations('friendCalendar');
  const locale = useLocale();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

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
  const addDayAvailability = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    onUpdateAvailableHours(friend.id, {
      dates: {
        ...friend.availableHours.dates,
        [newDate.toISOString()]: [0, 24],
      },
    });
  };
  return (
    <Card className='flex h-[520px] flex-col justify-between overflow-hidden'>
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
                  {t('dates.label')}
                </TabsTrigger>
                <TabsTrigger value='hours' className='flex items-center gap-2'>
                  <Clock className='h-4 w-4' />
                  {t('hours.label')}
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

        <CardContent className='grow p-4'>
          <TabsContent value='dates'>
            <div ref={calendarRef}>
              <Calendar
                required={false}
                mode='multiple'
                locale={dateLocaleMaps[locale as SupportedLocales]}
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
                month={selectedMonth}
                onMonthChange={setSelectedMonth}
                selected={friend.availableDates}
                onSelect={onDaySelect}
              />
            </div>
          </TabsContent>
          <TabsContent value='hours' className='flex flex-col justify-between'>
            <h5 className='mb-2 text-center text-sm font-medium'>
              {format(selectedMonth, 'MMMM yyyy')}
            </h5>
            <ScrollArea className='flex h-64 flex-col gap-1 overflow-hidden overflow-y-auto rounded-sm bg-foreground/5 p-4'>
              <TimeRangeSlider
                label={t('hours.weekdayRange')}
                colour={friend.color}
                value={friend.availableHours.weekdays}
                onChange={(value) =>
                  onUpdateAvailableHours(friend.id, {
                    weekdays: value,
                  })
                }
              />
              <TimeRangeSlider
                label={t('hours.weekendRange')}
                colour={friend.color}
                value={friend.availableHours.weekends}
                onChange={(value) =>
                  onUpdateAvailableHours(friend.id, {
                    weekends: value,
                  })
                }
              />
              {Object.keys(friend.availableHours.dates)
                .sort((dateA, dateB) => {
                  const dateAObj = new Date(dateA);
                  const dateBObj = new Date(dateB);
                  return dateAObj.getTime() - dateBObj.getTime();
                })
                .filter((date) => {
                  // Filter out dates that are not in the selected month
                  const dateObj = new Date(date);
                  return (
                    dateObj.getMonth() === selectedMonth.getMonth() &&
                    dateObj.getFullYear() === selectedMonth.getFullYear()
                  );
                })
                .map((date) => (
                  <TimeRangeSlider
                    key={date}
                    label={format(date, 'LLLL dd')}
                    colour={friend.color}
                    value={friend.availableHours.dates[date.toString()]}
                    onChange={(value) =>
                      onUpdateAvailableHours(friend.id, {
                        dates: {
                          ...friend.availableHours.dates,
                          [date.toString()]: value,
                        },
                      })
                    }
                  />
                ))}
            </ScrollArea>

            <div className='my-2 border-b border-b-slate-200' />

            <div className='flex items-center justify-end gap-2'>
              <DatePicker
                selectedDate={selectedDate}
                defaultMonth={selectedMonth}
                onDateChange={(date) => {
                  if (!date) {
                    setSelectedDate(undefined);
                    return;
                  }

                  const newDate = new Date(date);
                  newDate.setHours(0, 0, 0, 0);
                  setSelectedDate(date);
                }}
              />
              <Button
                variant='default'
                disabled={!selectedDate}
                onClick={() => {
                  addDayAvailability(selectedDate!);
                  setSelectedDate(undefined);
                }}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {t('hours.allDay')}
              </Button>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      <CardFooter className='flex flex-col items-start gap-2 px-3 pb-3 pt-0'>
        <div className='text-xs text-muted-foreground'>
          {t('availableDays', { count: friend.availableDates.length })}
        </div>

        <div className='w-full'>
          <div className='mb-1 flex items-center gap-2'>
            <Globe className='h-3 w-3 text-muted-foreground' />
            <Label htmlFor={`timezone-${friend.id}`} className='text-xs'>
              {t('timezone.label')}
            </Label>
          </div>
          <p className='text-xs text-muted-foreground'>{timezoneDisplayText}</p>
        </div>
      </CardFooter>
    </Card>
  );
}
