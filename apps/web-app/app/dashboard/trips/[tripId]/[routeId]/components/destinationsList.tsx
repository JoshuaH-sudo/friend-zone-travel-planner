'use client';
import { ScrollArea } from '@/components/ui/scroll-area';
import useGetDestinationsByRouteId from '@/lib/hooks/useGetDestinationsByRouteId';
import { ChevronDown, Trash2 } from 'lucide-react';
import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import deleteDestination from '../actions/deleteDestination';

export interface DestinationListProps {
  routeId: string;
  tripId: string;
}

const DestinationList: FC<DestinationListProps> = ({ routeId, tripId }) => {
  const { data: destinations = [] } = useGetDestinationsByRouteId(routeId);
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (destinationId: string) => {
      return deleteDestination(destinationId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['destinations', routeId],
      });
    },
    onError: (error) => {
      console.error('Error deleting destination:', error);
    },
  });

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
                  onClick={() =>
                    mutateAsync(destination.id)
                  }
                  title='Delete destination'
                >
                  <Trash2 className='text-muted-foreground h-4 w-4 hover:text-red-600' />
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
    </div>
  );
};

export default DestinationList;
