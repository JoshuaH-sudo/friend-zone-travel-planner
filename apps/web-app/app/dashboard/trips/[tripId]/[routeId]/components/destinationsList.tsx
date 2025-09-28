'use client';
import { ScrollArea } from '@/components/ui/scroll-area';
import useGetDestinationsByRouteId, {
  FullDestination,
} from '@/lib/hooks/useGetDestinationsByRouteId';
import { ChevronDown, Edit, Trash2 } from 'lucide-react';
import { FC } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import deleteDestination from '../actions/deleteDestination';
import { GetRouteByIdResponse } from '../../hooks/useGetRouteById';
import { format } from 'date-fns';

export interface DestinationListProps {
  route: GetRouteByIdResponse;
  selectedDestinationId?: string;
  onDestinationSelect: (destination: FullDestination) => void;
}

const DestinationList: FC<DestinationListProps> = ({
  route,
  selectedDestinationId,
  onDestinationSelect,
}) => {
  const { data: destinations = [] } = useGetDestinationsByRouteId(route.id);
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: async (destinationId: string) => {
      return deleteDestination(destinationId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['destinations', route.id],
      });
    },
    onError: (error) => {
      console.error('Error deleting destination:', error);
    },
  });

  return (
    <ScrollArea className='h-full py-2'>
      {destinations.map((destination, index) => (
        <div key={destination.id} className='flex flex-col items-center'>
          <div className='flex w-full flex-row items-center gap-2'>
            <div className='flex size-8 items-center justify-center rounded-full bg-gray-200 text-black'>
              {destination.order}
            </div>

            <div
              className={`flex flex-1 cursor-pointer flex-row gap-2 rounded-lg p-2 px-4 text-sm transition-colors duration-200 ${
                selectedDestinationId === destination.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : selectedDestinationId
                  ? 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  : 'bg-gray-200 text-black hover:bg-blue-400'
              }`}
              onClick={() => onDestinationSelect(destination)}
            >
              <p className='flex-1'>{destination.location}</p>
              <p>
                {format(destination.start_date, 'MMM d')} -{' '}
                {format(destination.end_date, 'MMM d')}
              </p>
              <p className='font-bold'>{destination.days} days</p>
            </div>

            <div className='text-sm text-gray-500'>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => onDestinationSelect(destination)}
                title='Edit destination'
              >
                <Edit className='text-muted-foreground h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => mutateAsync(destination.id)}
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
  );
};

export default DestinationList;
