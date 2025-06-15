import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePickerWithRange } from '@/components/ui/datePickerWithRange';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { ChevronDown } from 'lucide-react';
import { Destination } from '@/lib/generated/prisma';
import prisma from '@/lib/db';
import { DUMMY_LOGIN_USER_ID } from '../../page';
import { useForm } from 'react-hook-form';
import { TripRouteParams } from '../page';

type NewDestination = Omit<Destination, 'id'>;

export type RouteParams = TripRouteParams & {
  routeId: string;
};
export type RoutePageProps = {
  params: Promise<RouteParams>;
};
export default async function NewRoutePage({ params }: RoutePageProps) {
  const { routeId } = await params;
  const destinations: Destination[] = [];
  const friends = await prisma.friend.findMany({
    where: {
      userId: DUMMY_LOGIN_USER_ID,
      //TODO: Filter friends by location area to destination
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewDestination>({
    defaultValues: {
      location: '',
      order: 0, // Default order, can be adjusted later
      routeId: parseInt(routeId, 10),
    },
  });

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
            <Input placeholder={'Berlin'} className='w-full' />
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
                  key={friend.id}
                  className='cursor-pointer rounded-lg bg-gray-200 p-2 text-black transition-colors duration-200 hover:bg-red-400'
                >
                  {friend.name}
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
