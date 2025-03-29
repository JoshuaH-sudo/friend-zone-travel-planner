'use client';

import type { Friend } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  generateFriendIcal,
  generateCombinedIcal,
  downloadFile,
} from '@/lib/ical';
import { Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ExportCalendarProps {
  friends: Friend[];
  groupName: string;
}

export function ExportCalendar({ friends, groupName }: ExportCalendarProps) {
  const t = useTranslations();

  const exportSingleCalendar = (friend: Friend) => {
    const icalContent = generateFriendIcal(friend);
    const filename = `${friend.name.replace(/\s+/g, '_')}_availability.ics`;
    downloadFile(icalContent, filename);
  };

  const exportAllCalendars = () => {
    const icalContent = generateCombinedIcal(groupName, friends);
    const filename = groupName
      ? `${groupName.replace(/\s+/g, '_')}_availability.ics`
      : 'all_friends_availability.ics';
    downloadFile(icalContent, filename);
  };

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='mb-2 text-lg font-medium'>
          {t('actions.exportCalendars')}
        </h3>
        <p className='mb-4 text-sm text-muted-foreground'>
          {t('calendar.exportDescription')}
        </p>

        <div className='flex flex-wrap gap-2'>
          <Button
            onClick={exportAllCalendars}
            disabled={friends.length === 0}
            className='gap-2'
          >
            <Upload className='h-4 w-4' />
            {t('calendar.exportAll')}
          </Button>
        </div>
      </div>

      {friends.length > 0 && (
        <div>
          <h4 className='mb-2 text-sm font-medium'>
            {t('calendar.exportIndividual')}
          </h4>
          <div className='grid gap-2 sm:grid-cols-2 md:grid-cols-3'>
            {friends.map((friend) => (
              <Button
                key={friend.id}
                variant='outline'
                onClick={() => exportSingleCalendar(friend)}
                className='justify-start gap-2 overflow-hidden'
              >
                <span
                  className='inline-block h-3 w-3 flex-shrink-0 rounded-full'
                  style={{ backgroundColor: friend.color }}
                />
                <span className='truncate'>{friend.name}</span>
                <Upload className='ml-auto h-4 w-4 flex-shrink-0' />
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
