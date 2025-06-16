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
      <ScrollArea className='flex flex-col gap-2'>
        {destinations?.map((destination, index) => (
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
  );
};

export default DestinationList;
