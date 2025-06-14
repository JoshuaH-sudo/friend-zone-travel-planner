'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { DatePickerWithRange } from '@/components/ui/datePickerWithRange';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Destinations } from '@/type';


const DUMMMY_BERLIN_DESTINATION: Destinations = {
  location: 'Berlin',
  timezone: 'Europe/Berlin',
  utc: '+01:00',
  lat: 52.52,
  lng: 13.405,
  startDate: new Date('2024-05-01'),
  endDate: new Date('2024-05-10'),
  friends: [
    {
      id: 1,
      name: 'Josh',
      location: 'Berlin',
      lat: 52.52,
      lng: 13.405,
      available: {
        weekday: [9, 17],
        weekend: [10, 16],
      },
    },
    // Add more friends as needed
  ],
};

export default function PlannerPage() {
  const t = useTranslations();

  const [destinations, setDestinations] = useState<Destinations[]>([
    {
      location: 'Paris',
      timezone: 'Europe/Paris',
      utc: '+01:00',
      lat: 48.8566,
      lng: 2.3522,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-10'),
      friends: [
        {
          id: 2,
          name: 'Maria',
          location: 'Paris',
          lat: 48.8566,
          lng: 2.3522,
          available: {
            weekday: [10, 18],
            weekend: [11, 17],
          },
        },
        // Add more friends as needed
      ],
    },
  ]);
  const friends = ['josh', 'maria', 'john', 'lisa', 'david'];
  return (
    <div className='min-h-screen sm:h-[600px]'>
      <div
        id='route-name-section'
        className='mb-4 flex flex-row items-end justify-between gap-2'
      >
        <div className='flex-grow space-y-2'>
          <Label htmlFor='route-name'>Route Name</Label>
          <Input
            id='route-name'
            value={'Berlin Trip'}
            onChange={(e) => console.log(e.target.value)}
            placeholder={'Enter route` name'}
            className='max-w-md'
          />
        </div>
      </div>
      <div
        id='trip-details'
        className='flex h-full flex-col justify-between gap-4 sm:flex-row sm:items-start sm:justify-center'
      >
        <div id='route-list' className='h-1/3 bg-gray-500 p-2 sm:w-[30%]'>
          <p>Route</p>
          <ScrollArea className='flex flex-col gap-2'>
            {destinations.map((destination, index) => (
              <>
                <div
                  key={destination.location}
                  className='cursor-pointer rounded-lg bg-gray-200 p-2 text-black transition-colors duration-200 hover:bg-red-400'
                >
                  {destination.location}
                </div>
                {index < destinations.length - 1 && (
                  <ChevronDown
                    key={`dot-${index}`}
                    className='mx-auto size-6 text-black'
                  />
                )}
              </>
            ))}
          </ScrollArea>
        </div>

        <div
          id='destination-details'
          className='flex h-2/3 w-full flex-col gap-4 bg-gray-500 p-2 sm:w-[30%]'
        >
          <div>
            <p>Destination</p>
            <Input
              placeholder={'Berlin'}
              className='w-full'
              onChange={(e) => console.log('Search:', e.target.value)}
            />
          </div>

          <div>
            <p>Dates</p>
            <DatePickerWithRange />
          </div>

          <div className='h-1/3'>
            <p>Friends To See</p>
            <ScrollArea className='flex h-24 flex-col gap-2 overflow-auto'>
              {friends.map((friend) => (
                <div
                  key={friend}
                  className='cursor-pointer rounded-lg bg-gray-200 p-2 text-black transition-colors duration-200 hover:bg-red-400'
                >
                  {friend}
                </div>
              ))}
            </ScrollArea>
          </div>

          <button
            id='add-destination'
            className='w-full rounded-lg bg-green-500 p-2 text-white transition-colors duration-200 hover:bg-green-600'
          >
            Add
          </button>
        </div>

        <div
          id='map-overview'
          className='min-h-svh w-full max-w-xl bg-blue-500 sm:h-full'
        />
      </div>
    </div>
  );
}
