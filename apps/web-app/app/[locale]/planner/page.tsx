'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { DatePickerWithRange } from '@/components/ui/datePickerWithRange';
import { ScrollArea } from '@radix-ui/react-scroll-area';

export default function PlannerPage() {
  const t = useTranslations();

  const destinations = ['Paris', 'Tokyo', 'New York', 'Berlin', 'Sydney'];
  const friends = ['josh', 'maria', 'john', 'lisa', 'david'];
  return (
    <div className='h-96'>
      <div
        id='trip-name'
        className='mb-4 flex flex-row items-end justify-between gap-2'
      >
        <div className='flex-grow space-y-2'>
          <Label htmlFor='group-name'>{t('app.groupName')}</Label>
          <Input
            // TODO: rename this to trip name
            id='group-name'
            value={'Berlin Trip'}
            onChange={(e) => console.log(e.target.value)}
            placeholder={t('app.groupNamePlaceholder')}
            className='max-w-md'
          />
        </div>
      </div>
      <div
        id='trip-details'
        className='flex h-full flex-row items-start justify-between gap-4'
      >
        <div
          id='destinations-list'
          className='flex h-full w-[30%] flex-col gap-2 bg-gray-500 p-2'
        >
          {destinations.map((destination) => (
            <div
              key={destination}
              className='cursor-pointer rounded-lg bg-gray-200 p-2 text-black transition-colors duration-200 hover:bg-red-400'
            >
              {destination}
            </div>
          ))}
          <button
            id='add-destination'
            className='w-full rounded-lg bg-green-500 p-2 text-white transition-colors duration-200 hover:bg-green-600'
          >
            Add
          </button>
        </div>
        <div
          id='destination-details'
          className='h-full w-[30%] bg-gray-500 p-2'
        >
          <div>
            <p>Destination</p>
            <Input
              placeholder={'Berlin'}
              className='mb-4 w-full'
              onChange={(e) => console.log('Search:', e.target.value)}
            />
          </div>

          <div>
            <p>Dates</p>
            <DatePickerWithRange />
          </div>

          <div>
            <p>Friends To See</p>
            <ScrollArea className='h-32 overflow-x-auto'>
              {friends.map((friend) => (
                <div
                  key={friend}
                  className='my-2 cursor-pointer rounded-lg bg-gray-200 p-2 text-black transition-colors duration-200 hover:bg-red-400'
                >
                  {friend}
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
        <div id='map-overview' className='h-96 flex-1 bg-blue-500' />
      </div>
    </div>
  );
}
