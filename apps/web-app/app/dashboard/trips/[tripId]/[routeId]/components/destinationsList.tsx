'use client';
import { ScrollArea } from '@/components/ui/scroll-area';
import useGetDestinationsByRouteId from '@/lib/hooks/useGetDestinationsByRouteId';
import { ChevronDown, Trash2 } from 'lucide-react';
import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import DeleteDestinationDialog from './DeleteDestinationDialog';

export interface DestinationListProps {
  routeId: string;
  tripId: string;
}

const DestinationList: FC<DestinationListProps> = ({ routeId, tripId }) => {
  const { data: destinations = [] } = useGetDestinationsByRouteId(routeId);
  const [deleting, setDeleting] = useState<{ id: string; location?: string } | null>(null)
  return (
    <div>
      <p>Route</p>
      <ScrollArea className='h-full'>
        {destinations.map((destination, index) => (
          <div key={destination.id} className='flex flex-col items-center'>
            <div className='flex w-full flex-row items-center gap-2'>
              <div className='flex size-8 items-center justify-center rounded-full bg-gray-200 text-black'>
                {index + 1}
              </div>

              <div className='flex flex-1 cursor-pointer flex-row gap-2 rounded-lg bg-gray-200 p-2 px-4 text-sm text-black transition-colors duration-200 hover:bg-red-400'>
                <p className='flex-1'>{destination.location}</p>
                <p>{destination.startDate.toLocaleDateString()}</p>
                <p>{destination.endDate.toLocaleDateString()}</p>
              </div>

              <div className='text-sm text-gray-500'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={() => setDeleting({ id: destination.id, location: destination.location })}
                  title='Delete destination'
                >
                  <Trash2 className='h-4 w-4 text-muted-foreground hover:text-red-600' />
                </Button>
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
      <DeleteDestinationDialog 
        destination={deleting}
        tripId={tripId}
        routeId={routeId}
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  );
};

export default DestinationList;
