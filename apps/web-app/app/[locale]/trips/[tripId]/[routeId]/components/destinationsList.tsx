'use client';
import { ScrollArea } from '@/components/ui/scroll-area';
import useGetDestinationsByRouteId from '@/lib/hooks/useGetDestinationsByRouteId';
import { ChevronDown } from 'lucide-react';
import { FC } from 'react';

export interface DestinationListProps {
  routeId: number;
}

const DestinationList: FC<DestinationListProps> = ({ routeId }) => {
  const { data: destinations } = useGetDestinationsByRouteId(routeId);
  return (
    <div>
      <p>Route</p>
      <ScrollArea className='h-full'>
        {destinations?.map((destination, index) => (
          <div key={destination.id} className='flex flex-col items-center'>
            <div className='flex flex-row items-center gap-2 w-full'>
              <div className='flex size-8 items-center justify-center rounded-full bg-gray-200 text-black'>
                {index + 1}
              </div>

              <div className='cursor-pointer rounded-lg bg-gray-200 p-2 px-4 text-black transition-colors duration-200 hover:bg-red-400 flex-1'>
                {destination.location}
              </div>
            </div>
            {index < destinations.length - 1 && (
              <ChevronDown
                key={`dot-${index}`}
                className='mx-auto size-6 text-black'
              />
            )}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default DestinationList;
